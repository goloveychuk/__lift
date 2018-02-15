import registerServiceWorker from './registerServiceWorker';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RootView } from './view'
import './index.css';





ReactDOM.render(
  <RootView />,
  // <TestView/>,
  document.getElementById('root') as HTMLElement
);



// function registerTextArea(t: HTMLTextAreaElement) {
//   textareas.push(new TextAreaWrapper(t))
// }

// let textareas: TextAreaWrapper[] = []



// registerTextArea(document.getElementsByTagName('textarea').item(0))


// registerServiceWorker();
