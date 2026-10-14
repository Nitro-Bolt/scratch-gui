import 'monaco-editor/basic-languages/monaco.contribution.js';

self.MonacoEnvironment = {
    getWorker (_workerId, label) {
        return new Worker(new URL(
            'monaco-editor/editor/editor.worker.js',
            import.meta.url
        ), {name: label, type: 'module'});
    }
};
