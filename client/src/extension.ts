import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import OgoneClient from './classes/OgoneClient';
import OgoneWebview from './classes/OgoneWebview';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// select ogone files
		// trigger changes to server only if those files are changed
		documentSelector: [{ scheme: 'file', language: 'ogone' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'OgoneLSP',
		'Ogone',
		serverOptions,
		clientOptions
	);
	// Start the client. This will also launch the server
	client.start();
	const config = workspace.getConfiguration();
	workspace.findFiles('**/*.o3').then((files) => {
		const webview = new OgoneWebview({ context, files });
		// hooks on the workspace
		const updateWebview = (document) => {
			if (document.languageId === 'ogone') {
				webview.setDocument(document);
				webview.updateWebview(false);
			}
		}
		workspace.onDidOpenTextDocument(updateWebview);
		workspace.onDidSaveTextDocument(updateWebview);
		workspace.onDidChangeTextDocument((ev) => {
			const { document } = ev;
			if (document.languageId === 'ogone') {
				webview.setDocument(document);
				webview.updateWebview(false);
			}
		});
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

export default new OgoneClient({});