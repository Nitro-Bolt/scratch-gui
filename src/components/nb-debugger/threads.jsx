import React from 'react';
import classNames from 'classnames';
import styles from './threads.css';

const Thread = React.memo(props => (
    <div className={styles.thread}>
        <a onClick={props.onSelectTarget}>
            {props.thread.target.sprite.name}
        </a>
        <span>
            {Object.values(props.thread.blockContainer._blocks).filter(b => !b.shadow).length} blocks
        </span>
        <div className={styles.buttons}>
            {!props.thread.isCompiled &&
                <button
                    className={classNames(styles.button, props.thread.isPaused ? styles.playOption : styles.pauseOption)}
                    onClick={() => props.thread.isPaused = !props.thread.isPaused}
                />
            }
            <button
                    className={classNames(styles.button, styles.deleteOption)}
                    onClick={props.onDelete}
                />
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
                <span className={styles.noThreads}>No threads running</span>
            )}
        </div>
    );
});

export default ThreadsTab;
