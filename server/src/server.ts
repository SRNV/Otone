/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	CompletionList,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentColorParams,
	Hover
} from 'vscode-languageserver';

import Ogone from './classes/Ogone';
import {
	TextDocument
} from 'vscode-languageserver-textdocument';
import { ColorInformation } from 'vscode-css-languageservice';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);
const ogoneExtension = new Ogone(connection);

// Create a simple text document manager.
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			colorProvider : true,
			hoverProvider : true,
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

// Revalidate all open text documents
documents.all().forEach(validateTextDocument);

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.OgoneLSP || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'OgoneLSP'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	ogoneExtension.read(textDocument);
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const document = documents.get(_textDocumentPosition.textDocument.uri);
		if (!document) return null;
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		ogoneExtension.updatePosition(_textDocumentPosition.position);
		if (ogoneExtension.isInStyleNode(document, _textDocumentPosition.position)) {
			const cssComp = ogoneExtension.doStyleCompletion(document);
			// @ts-ignore
			return cssComp.items;
		}
	}
);
connection.onColorPresentation((colorPresentationParams) => {
	if (!colorPresentationParams) return [];
	const document = documents.get(colorPresentationParams.textDocument.uri);
	if (!document) return [];
	return ogoneExtension.getColorPresentation(document, colorPresentationParams.color, colorPresentationParams.range);
})
/*
*/
connection.onDocumentColor((params: DocumentColorParams): ColorInformation[] => {
	if(!params) return [];
	const document = documents.get(params.textDocument.uri);
	if (!document) return [];
	return ogoneExtension.findDocumentColors(document);
});
connection.onHover(async (params: TextDocumentPositionParams) => {
	if (!params) return;
	const document = documents.get(params.textDocument.uri);
	if (!document) return;
	if (ogoneExtension.isInDefModifier(document, params.position)) {
		const yamlHover = await ogoneExtension.doYAMLHover(document, params.position);
		return yamlHover;
	}
	if (ogoneExtension.isInStyleNode(document, params.position)) {
		const hover = ogoneExtension.doStyleHover(document, params.position);
		return hover;
	}
	if (ogoneExtension.isInTemplate(document, params.position)) {
		return ogoneExtension.doHTMLHover(document, params.position);
	}
});
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
