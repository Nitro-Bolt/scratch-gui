import React from 'react';
 import {FormattedMessage} from 'react-intl';
 import styles from './load-extension.css';
 import {APP_NAME} from '../../lib/brand';
 
 const Unsandbox = props => (
     <div>
         <p>
             <FormattedMessage
                 defaultMessage="The project is asking to unsandbox the {EXT_NAME} extension."
                 // eslint-disable-next-line max-len
                 description="Part of modal that appears when a project tries to unsandbox an extension"
                 id="pm.unsandbox.title"
                 values={{
                     EXT_NAME: props.name
                 }}
             />
         </p>
         <div className={styles.unsandboxedWarning}>
             <FormattedMessage
                 // eslint-disable-next-line max-len
                 defaultMessage="Loading extensions without the sandbox is dangerous. It will be able to corrupt your project, delete your settings, phish for passwords, and other bad things. The {APP_NAME} developers are not responsible for any resulting issues."
                 description="Part of modal asking for permission to automatically load custom extension"
                 id="tw.loadExtension.unsandboxedWarning"
                 values={{
                     APP_NAME
                 }}
             />
         </div>
     </div>
 );
 
 export default Unsandbox;