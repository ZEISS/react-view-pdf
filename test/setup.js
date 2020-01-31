const Adapter = require('enzyme-adapter-react-16');
const { raf } = require('./temp-polyfills');
const { configure, shallow, render, mount } = require('enzyme');

// React 16 Enzyme adapter
configure({
  adapter: new Adapter(),
});

global.matchMedia = jest.fn(() => ({
  matches: true,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));
global.shallow = shallow;
global.render = render;
global.mount = mount;
