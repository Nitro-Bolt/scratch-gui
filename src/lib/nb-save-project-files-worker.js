self.onmessage = event => {
    const projectData = new TextEncoder().encode(event.data);
    self.postMessage(projectData, [projectData.buffer]);
};
