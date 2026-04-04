import React from 'react';
import classNames from 'classnames';
import styles from './threads.css';

import deleteIcon from './icons/icon--delete.svg';
import pauseIcon from './icons/icon--pause.svg';
import playIcon from './icons/icon--play.svg';

const Thread = React.memo(props => (
    <div className={styles.thread}>
        <div className={styles.buttons}>
            <a onClick={props.onSelectTarget}>
                {props.thread.target.sprite.name}
            </a>
            <img
                src={deleteIcon}
                draggable={false}
                onClick={props.onDelete}
            />
            {!props.compilerEnabled &&
                <img
                    src={props.thread.isPaused ? playIcon : pauseIcon}
                    draggable={false}
                    onClick={() => props.thread.isPaused = !props.thread.isPaused}
                />
            }
            <span>
                {Object.values(props.thread.blockContainer._blocks).filter(b => !b.shadow).length} blocks
            </span>
        </div>
    </div>
));

const ThreadsTab = React.memo(props => {
    return (
        <div className={styles.container}>
            {props.threads.length > 0 ? props.threads.map((thread, i) => (
                <Thread
                    key={i}
                    thread={thread}
                    onSelectTarget={() => props.onSelectTarget(thread.target)}
                    onDelete={() => props.vm.runtime._stopThread(thread)}
                    compilerEnabled={props.vm.runtime.compilerOptions.enabled}
                />
            )) : (
                <h3 className={styles.noThreads}>No threads running</h3>
            )}
        </div>
    );
});

export default ThreadsTab;