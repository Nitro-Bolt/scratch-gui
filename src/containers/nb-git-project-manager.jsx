import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import log from '../lib/log';
import {setProjectUnchanged} from '../reducers/project-changed';

const SYNC_DEBOUNCE_MS = 750;

let activeManager = null;

const pauseGitProjectSync = async () => {
    if (activeManager) await activeManager.pauseAndFlush();
};

const resumeGitProjectSync = () => {
    if (activeManager) activeManager.resume();
};

const markGitProjectLoaded = () => {
    if (activeManager) activeManager.markProjectLoaded();
};

const requestGitProjectSync = async projectPath => {
    if (activeManager) await activeManager.requestSync(projectPath);
};

class NBGitProjectManager extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleProjectChanged'
        ]);
        this.timeout = null;
        this.inFlight = null;
        this.generation = 0;
        this.syncedGeneration = 0;
        this.pauseDepth = 0;
    }

    componentDidMount () {
        activeManager = this;
        this.props.vm.on('PROJECT_CHANGED', this.handleProjectChanged);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.vm !== this.props.vm) {
            prevProps.vm.off('PROJECT_CHANGED', this.handleProjectChanged);
            this.props.vm.on('PROJECT_CHANGED', this.handleProjectChanged);
        }
        if (prevProps.projectPath !== this.props.projectPath) {
            this.resetSyncState();
        }
    }

    componentWillUnmount () {
        if (activeManager === this) activeManager = null;
        this.props.vm.off('PROJECT_CHANGED', this.handleProjectChanged);
        this.clearTimeout();
    }

    clearTimeout () {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    handleProjectChanged () {
        if (!this.props.projectPath || typeof window === 'undefined' || !window.Git) return;
        this.generation++;
        this.queueSync();
    }

    queueSync () {
        if (this.pauseDepth > 0 || this.timeout !== null || !this.props.projectPath ||
            typeof window === 'undefined' || !window.Git) return;
        this.timeout = setTimeout(() => {
            this.timeout = null;
            this.flush().catch(error => {
                // Keep the project dirty. A later edit will retry the sync.
                log.error('Could not save the Git project', error);
            });
        }, SYNC_DEBOUNCE_MS);
    }

    async flush (whilePaused = false) {
        if ((!whilePaused && this.pauseDepth > 0) || !this.props.projectPath ||
            typeof window === 'undefined' || !window.Git) return;

        if (this.inFlight) {
            await this.inFlight;
            if (this.generation > this.syncedGeneration) return this.flush(whilePaused);
            return;
        }

        if (this.generation <= this.syncedGeneration) return;

        const projectPath = this.props.projectPath;
        const generation = this.generation;
        this.inFlight = (async () => {
            await this.saveProject(projectPath);
            if (this.props.projectPath === projectPath) {
                this.syncedGeneration = Math.max(this.syncedGeneration, generation);
                if (this.generation === generation) this.props.onProjectUnchanged();
            }
        })();

        try {
            await this.inFlight;
        } finally {
            this.inFlight = null;
        }

        if (this.generation > this.syncedGeneration) {
            if (whilePaused) return this.flush(true);
            this.queueSync();
        }
    }

    async saveProject (projectPath) {
        const workspaceXML = this.props.vm.runtime.targets.filter(target => target.isOriginal).map(target => ({
            id: target.id,
            isStage: target.isStage,
            name: target.getName(),
            scripts: target.blocks._scripts.map(id => {
                const block = target.blocks.getBlock(id);
                return {
                    id,
                    x: Number(block && block.x) || 0,
                    y: Number(block && block.y) || 0,
                    xml: target.blocks.blockToXML(id, target.comments)
                };
            }).filter(script => Boolean(script.xml))
        }));
        const archive = await this.props.vm.saveProjectSb3('arraybuffer');
        const result = await window.Git.syncProject(projectPath, archive, workspaceXML);
        if (!result.success) throw new Error(result.error || 'Could not save the Git project');
    }

    async pauseAndFlush () {
        this.pauseDepth++;
        this.clearTimeout();
        try {
            if (this.inFlight) await this.inFlight;
            while (this.generation > this.syncedGeneration) await this.flush(true);
        } catch (error) {
            this.pauseDepth--;
            this.queueSync();
            throw error;
        }
    }

    async requestSync (requestedPath = this.props.projectPath) {
        if (!requestedPath || typeof window === 'undefined' || !window.Git) return;
        if (requestedPath !== this.props.projectPath) {
            await this.saveProject(requestedPath);
            this.props.onProjectUnchanged();
            return;
        }
        this.generation++;
        this.clearTimeout();
        await this.flush(this.pauseDepth > 0);
    }

    resume () {
        if (this.pauseDepth > 0) this.pauseDepth--;
        this.queueSync();
    }

    markProjectLoaded () {
        this.resetSyncState();
        this.props.onProjectUnchanged();
    }

    resetSyncState () {
        this.clearTimeout();
        this.generation = 0;
        this.syncedGeneration = 0;
    }

    render () {
        return null;
    }
}

NBGitProjectManager.propTypes = {
    onProjectUnchanged: PropTypes.func.isRequired,
    projectPath: PropTypes.string,
    vm: PropTypes.shape({
        off: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        runtime: PropTypes.shape({
            targets: PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired,
        saveProjectSb3: PropTypes.func.isRequired
    }).isRequired
};

const mapStateToProps = state => ({
    projectPath: state.scratchGui.tw.gitProjectPath,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onProjectUnchanged: () => dispatch(setProjectUnchanged())
});

export {
    markGitProjectLoaded,
    pauseGitProjectSync,
    requestGitProjectSync,
    resumeGitProjectSync
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBGitProjectManager);
