import omit from 'lodash.omit';
import PropTypes from 'prop-types';
import React from 'react';
import Style from 'to-style';
import stylePropType from 'react-style-proptype';

/*
 * DOMElementRenderer wraps a DOM element, allowing it to be
 * rendered by React. It's up to the containing component
 * to retain a reference to the element prop, or else it
 * will be garbage collected after unmounting.
 *
 * Props passed to the DOMElementRenderer will be set on the
 * DOM element like it's a normal component.
 */
class DOMElementRenderer extends React.Component {
    constructor (props) {
        super(props);
        this.setContainer = this.setContainer.bind(this);
    }
    componentDidMount () {
        if (!this.props.domElement) return;
        this.container.appendChild(this.props.domElement);
    }
    componentWillUnmount () {
        if (!this.props.domElement) return;
        if (this.props.domElement.parentNode !== this.container) return;
        this.container.removeChild(this.props.domElement);
    }
    setContainer (c) {
        this.container = c;
    }
    render () {
        let element = this.props.domElement;
        // if we where never passed an element, ensure Object.assign doesnt error out about
        if (!element) {
            element = document.createElement('span');
            element.innerText = 'ERR: No element provided';
            console.warn('No element provided to the DOMElementRenderer');
        }
        // Apply props to the DOM element, so its attributes
        // are updated as if it were a normal component.
        // Look at me, I'm the React now!
        Object.assign(
            element,
            omit(this.props, ['domElement', 'children', 'style'])
        );

        // Convert react style prop to dom element styling.
        if (this.props.style) {
            element.style.cssText = Style.string(this.props.style);
        }
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(element);
        }

        return <div ref={this.setContainer} />;
    }
}

DOMElementRenderer.propTypes = {
    domElement: PropTypes.instanceOf(Element).isRequired,
    style: stylePropType
};

export default DOMElementRenderer;
