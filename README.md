# React PDF Reader

The purpose of this library is to provide a React component that works as a PDF Reader. It's basically a React wrapper from the pdf.js library from Mozilla.

## Using the Library

The library can be installed via the following commands:

```sh
npm i --save-dev react-view-pdf
```

Because this library uses components from `precise-ui`, it is necessary to add it as a dependency to your project:

```sh
npm i precise-ui
```

Then, simply import the component like below:

```js
import { PDFViewer } from 'react-view-pdf';

<PDFViewer url="http://www.africau.edu/images/default/sample.pdf" />

```

## Contributing

Feel free to contribute to it or open issues in case of bugs.


## Roadmap

1. Remove dependency on `precise-ui`.
2. Allow selection of texts.
3. Add built-in download button.