import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from './log';

import { setProjectTitle } from '../reducers/project-title';
import { setAuthor, setDescription, setExtraProjectInfo, setRemixedProjectInfo } from '../reducers/tw';

const API_URL = 'https://projects.penguinmod.com/api/v1/projects/getproject?projectID=$id&requestType=metadata';
const API_REMIX_URL = 'https://projects.penguinmod.com/api/v1/projects/getremixes?projectId=$id';

function APIProjectToReadableProject(apiProject) {
    return {
        id: apiProject.id,
        name: apiProject.title,
        desc: apiProject.instructions,
        notes: apiProject.notes,
        author: { id: apiProject.author.id, username: apiProject.author.username }
    }
}

const fetchProjectMeta = projectId => fetch(API_URL.replace('$id', projectId))
    .then(r => {
        if (r.status === 404) {
            throw new Error('Probably unshared (API returned 404)');
        }
        if (r.status !== 200) {
            throw new Error(`Unexpected status code: ${r.status}`);
        }
        return r.json();
    });
const fetchProjectRemixes = projectId => fetch(API_REMIX_URL.replace('$id', projectId))
    .then(r => {
        if (r.status !== 200) {
            throw new Error(`Unexpected status code: ${r.status}`);
        }
        return r.json();
    });

const getNoIndexTag = () => document.querySelector('meta[name="robots"][content="noindex"]');
const setIndexable = indexable => {
    if (indexable) {
        const tag = getNoIndexTag();
        if (tag) {
            tag.remove();
        }
    } else if (!getNoIndexTag()) {
        const tag = document.createElement('meta');
        tag.name = 'robots';
        tag.content = 'noindex';
        document.head.appendChild(tag);
    }
};

const TWProjectMetaFetcherHOC = function (WrappedComponent) {
    class ProjectMetaFetcherComponent extends React.Component {
        shouldComponentUpdate(nextProps) {
            return this.props.projectId !== nextProps.projectId;
        }
        componentDidUpdate() {
            // project title resetting is handled in titled-hoc.jsx
            if (this.props.vm.runtime.renderer.setPrivateSkinAccess)
                this.props.vm.runtime.renderer.setPrivateSkinAccess(true);
            this.props.onSetAuthor('', '');
            this.props.onSetDescription('', '');
            this.props.onSetRemixedProjectInfo(false, '', '');
            const projectId = this.props.projectId;
            // Don't try to load metadata for empty projects.
            if (projectId === '0') {
                return;
            }
            fetchProjectMeta(projectId)
                .then(data => {
                    /* todo: fix this and make it work properly */
                    // window.LastFetchedProject = data
                    // window.FetchedProjectRemixes = null
                    // window.CurrentRemixFetchRequestId += 1
                    // let currentReq = window.CurrentRemixFetchRequestId
                    // fetchProjectRemixes(projectId).then(remixes => {
                    //     if (!currentReq == window.CurrentRemixFetchRequestId) return console.log("abandoned request");
                    //     if (remixes.length <= 0) {
                    //         window.FetchedProjectRemixes = null;
                    //         return;
                    //     }
                    //     window.FetchedProjectRemixes = remixes
                    //     window.ForceProjectRemixListUpdate += 1
                    // })
                    const rawData = data;
                    data = APIProjectToReadableProject(data);
                    // If project ID changed, ignore the results.
                    if (this.props.projectId !== projectId) {
                        return;
                    }
                    const title = data.name;
                    if (title) {
                        this.props.onSetProjectTitle(title);
                    }
                    const authorName = data.author.username;
                    const authorThumbnail = `https://projects.penguinmod.com/api/v1/users/getpfp?username=${data.author.username}`;
                    this.props.onSetAuthor(authorName, authorThumbnail);
                    const instructions = data.desc || '';
                    const credits = data.notes || '';
                    if (instructions || credits) {
                        this.props.onSetDescription(instructions, credits);
                    }
                    if (
                        rawData.public === true
                    ) {
                        this.props.onSetExtraProjectInfo(
                            !rawData.softRejected,
                            String(rawData.remix) !== '0',
                            String(rawData.remix),
                            false,
                            authorName,
                            new Date(rawData.lastUpdate),
                            rawData.lastUpdate !== rawData.date
                        );

                        if (String(rawData.remix) !== '0') {
                            // this is a remix, find the original project
                            fetchProjectMeta(rawData.remix)
                                .then(remixProject => {
                                    // If project ID changed, ignore the results.
                                    if (this.props.projectId !== projectId) {
                                        return;
                                    }

                                    this.props.onSetRemixedProjectInfo(
                                        true, // loaded
                                        remixProject.title,
                                        remixProject.author.username
                                    );
                                })
                                .catch(err => {
                                    // this isnt fatal, just log
                                    log.warn('cannot fetch remixed project meta for this project;', err);
                                });
                        }
                    }
                    setIndexable(true);
                })
                .catch(err => {
                    if (this.props.vm.runtime.renderer.setPrivateSkinAccess)
                        this.props.vm.runtime.renderer.setPrivateSkinAccess(false);
                    setIndexable(false);
                    if (`${err}`.includes('unshared')) {
                        this.props.onSetDescription('unshared', 'unshared');
                    }
                    log.warn('cannot fetch project meta', err);
                });
        }
        render() {
            const {
                /* eslint-disable no-unused-vars */
                projectId,
                onSetAuthor,
                onSetDescription,
                onSetProjectTitle,
                vm,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return (
                <WrappedComponent
                    {...props}
                />
            );
        }
    }
    ProjectMetaFetcherComponent.propTypes = {
        projectId: PropTypes.string,
        onSetAuthor: PropTypes.func,
        onSetDescription: PropTypes.func,
        onSetProjectTitle: PropTypes.func,
        vm: PropTypes.shape({
            runtime: PropTypes.shape({
                renderer: PropTypes.shape({
                    setPrivateSkinAccess: PropTypes.func
                })
            })
        })
    };
    const mapStateToProps = state => ({
        projectId: state.scratchGui.projectState.projectId,
        vm: state.scratchGui.vm
    });
    const mapDispatchToProps = dispatch => ({
        onSetAuthor: (username, thumbnail) => dispatch(setAuthor({
            username,
            thumbnail
        })),
        onSetDescription: (instructions, credits) => dispatch(setDescription({
            instructions,
            credits
        })),
        onSetExtraProjectInfo: (accepted, isRemix, remixId, tooLarge, author, releaseDate, isUpdated) => dispatch(setExtraProjectInfo({
            accepted,
            isRemix,
            remixId,
            tooLarge,
            author,
            releaseDate,
            isUpdated
        })),
        onSetRemixedProjectInfo: (loaded, name, author) => dispatch(setRemixedProjectInfo({
            loaded,
            name,
            author
        })),
        onSetProjectTitle: title => dispatch(setProjectTitle(title))
    });
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(ProjectMetaFetcherComponent);
};

export {
    TWProjectMetaFetcherHOC as default
};
