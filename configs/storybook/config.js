import { configure, addParameters, addDecorator } from '@storybook/html';
import { withNotes } from '@storybook/addon-notes';
import { withOptions } from '@storybook/addon-options';


addDecorator(
  withOptions({
    name: 'Apress UI',
    url: 'http://idbolshakov.github.io/pulscen-ui',
  })
);

addDecorator(withNotes);

// automatically import all files ending in *.stories.js
const req = require.context('../../tmp/stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
