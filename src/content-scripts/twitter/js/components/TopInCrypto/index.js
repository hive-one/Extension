import { h, Component, render } from 'preact';

class FooBar extends Component {
    render() {
        return (
            <div>
                <p>Hello World</p>
            </div>
        );
    }
}

export default function runTopCrypto() {
    let termsAElem = document.querySelector('a[href="https://twitter.com/tos"]');
    let sideElem = termsAElem.parentNode.parentNode.parentNode;
    console.log(sideElem);
}

render(FooBar);
