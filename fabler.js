////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start dependencies section

const
  fs      = require('fs'),
  rimraf  = require('rimraf').sync,
  webpack = require('webpack'),

  commonWebpackConfig = require(__dirname + '/configs/webpack.config.js');

// end dependencies section
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start blocks section

const generateColorsBlocks = () => {
  const colorFiles = fs.readdirSync(__dirname + '/src/colors/');

  colorFiles.forEach(file => {
    const project = file.slice(0, -5);

    const colors = JSON.parse(fs.readFileSync(__dirname + '/src/colors/' + file));

    if (!colors || !Object.keys(colors).length) return;

    const colorsVars = Object.keys(colors).map(key => `  --${key}: ${colors[key]};`);

    const examples = Object.keys(colors).map(key =>
      `
        <div
          style="
            outline: solid black 1px;
            position: relative;
            font-family: monospace;
            width: 100px;
            height: 100px;
            line-height: 50px;
            display: inline-block;
            padding: 1em;
            margin: 0.5em;
            background: var(--${key});
            text-align: center;"
        >
          <strong style="padding: 0.5em; background: white; text-decoration: underline; font-size: 0.9em;">${key}</strong>
          <br>
          <strong style="background: white; padding: 0.5em;">${colors[key]}</strong>
        </div>`
    );

    fs.existsSync(__dirname + '/tmp/blocks') || fs.mkdirSync(__dirname + '/tmp/blocks');
    fs.existsSync(__dirname + '/tmp/blocks/' + project) || fs.mkdirSync(__dirname + '/tmp/blocks/' + project);
    fs.existsSync(__dirname + '/tmp/blocks/' + project + '/colors') || fs.mkdirSync(__dirname + '/tmp/blocks/' + project + '/colors');
    fs.existsSync(__dirname + '/tmp/blocks/' + project + '/colors/example') || fs.mkdirSync(__dirname + '/tmp/blocks/' + project + '/colors/example');

    fs.writeFileSync(__dirname + '/tmp/blocks/' + project + '/colors/index.js', "import './colors.css';");
    fs.writeFileSync(__dirname + '/tmp/blocks/' + project + '/colors/colors.css', `:root {\n${colorsVars.join('\n')}\n}`);
    fs.writeFileSync(__dirname + '/tmp/blocks/' + project + '/colors/example/all.html', examples.join('\n'));
  });
}

const buildBlocks = () => {
  const projects = fs.readdirSync(__dirname + '/src/blocks/');
  projects.forEach(project => {
    runWebpack(project);
  });
}

const runWebpack = project => {

  const entries = {};

  if (fs.existsSync(__dirname + '/src/blocks/' + project)) {
    const blocks = fs.readdirSync(__dirname + '/src/blocks/' + project);

    blocks.forEach(block => entries[block] = __dirname + '/src/blocks/' + project + '/' + block + '/index.js');
  }

  if (fs.existsSync(__dirname + '/tmp/blocks/' + project)) {
    const blocks = fs.readdirSync(__dirname + '/tmp/blocks/' + project);

    blocks.forEach(block => entries[block] = __dirname + '/tmp/blocks/' + project + '/' + block + '/index.js');
  }

  commonWebpackConfig.output.path = __dirname + '/dist/' + project;
  commonWebpackConfig.entry = entries;

  webpack(commonWebpackConfig, () => {
    console.log(`webpack build for ${project} blocks completed`)
    buildStories(project);
  });
}

const generateNotes = (exampleName, project, block) => {

  let note = '';

  const notePath = __dirname + '/src/blocks/' + project + '/' + block + '/notes/' + exampleName.slice(0, -5) + '.json';

  if (fs.existsSync(notePath)) {
    note = JSON.parse(fs.readFileSync(notePath));

    if (note.extends) {
      note.text = JSON.parse(fs.readFileSync(__dirname + '/src/blocks/' + note.extends)).text + '\n' + (note.text || '');
    }
  }

  return `\`
  <p>${note.text || ''}</p>
<details>
<summary>HTML</summary>
<code>
<xmp style="padding: 1em; font-weight: bold; background: #555; color: #fff">
\$\{${exampleName.slice(0, -5)}Example\}</xmp>
</code>
</details>
\``;
}

const buildStories = project => {
  fs.existsSync(__dirname + '/tmp/stories') || fs.mkdirSync(__dirname + '/tmp/stories');

  // permament blocks
  let blocks = fs.readdirSync(__dirname + '/src/blocks/' + project);
  blocks.forEach(block => {
    const examples = fs.readdirSync(__dirname + '/src/blocks/' + project + '/' + block + '/example');

    const examplesImport = examples.map(example =>
      example.substr(-5) === '.html'
        ? `import ${example.slice(0, -5)}Example from '../../src/blocks/${project}/${block}/example/${example}';`
        : ' '
    );

    const getStoryContent = exampleName => `
      \`<style>
        ${fs.readFileSync(`dist/${project}/${block}.css`)}
        ${fs.existsSync(`dist/${project}/colors.css`) && fs.readFileSync(`dist/${project}/colors.css`)}
      </style>
      <script>${fs.readFileSync(`dist/${project}/${block}.js`)}</script>\` + 

      ${exampleName.slice(0, -5)}Example
    `;

    const stories = examples.map(example =>
      example.substr(-5) === '.html'
        ? `.add('${example.slice(0, -5)}', () => ${getStoryContent(example)},{notes: ${generateNotes(example, project, block)} })`
        : ''
    );


    fs.writeFileSync(__dirname + '/tmp//stories/' + project + '_' + block + '.stories.js', `
      import { document, console } from 'global';
      import { storiesOf } from '@storybook/html';

      ${examplesImport.join('\n')}

      storiesOf('Blocks/${project}/${block}', module)
      ${stories.join('\n')};
    `);
  });

  // temporary blocks
  if (fs.existsSync(__dirname + '/tmp/blocks/' + project)) {
    blocks = fs.readdirSync(__dirname + '/tmp/blocks/' + project);
    blocks.forEach(block => {
      const examples = fs.readdirSync(__dirname + '/tmp/blocks/' + project + '/' + block + '/example');

      const examplesImport = examples.map(example =>
        `import ${example.slice(0, -5)}Example from '../../tmp/blocks/${project}/${block}/example/${example}';`
      );

      const getStoryContent = exampleName => `
        \`<style>${fs.readFileSync(`dist/${project}/${block}.css`)}</style>
        <script>${fs.readFileSync(`dist/${project}/${block}.js`)}</script>\` + 

        ${exampleName.slice(0, -5)}Example
      `;

      const stories = examples.map(example => {
        return `.add('${example.slice(0, -5)}', () => ${getStoryContent(example)})`
      });


      fs.writeFileSync(__dirname + '/tmp//stories/' + project + '_' + block + '.stories.js', `
        import { document, console } from 'global';
        import { storiesOf } from '@storybook/html';

        ${examplesImport.join('\n')}

        storiesOf('Blocks/${project}/${block}', module)
        ${stories.join('\n')};
      `);
    });
  }

  console.log(`stories generation for ${project} blocks completed`);
}

// end blocks section
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start docs section

const buildDocs = () => {
  const projects = fs.readdirSync(__dirname + '/src/docs/');
  projects.forEach(project => {
    buildDocsStories(project);
  });
}

const buildDocsStories = project => {
  fs.existsSync(__dirname + '/tmp/stories') || fs.mkdirSync(__dirname + '/tmp/stories');

  let docs = fs.readdirSync(__dirname + '/src/docs/' + project);

  let docsImport = [];
  docs.forEach(doc =>
    docsImport.push(`import ${doc.replace(/ /g, '_')} from '${__dirname}/src/docs/${project}/${doc}/index.html';`)
  );

  const stories = docs.map(doc => `.add('${doc}', () => ${doc.replace(/ /g, '_')})`);

  fs.writeFileSync(__dirname + '/tmp/stories/' + project + '.docs.stories.js', `
    import { document, console } from 'global';
    import { storiesOf } from '@storybook/html';

    ${docsImport.join('\n')}

    storiesOf('Docs/${project}', module)
    ${stories.join('\n')};
  `);

  console.log(`documents stories generation for ${project} blocks completed`);
}

// end docs section
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = () => {
  fs.existsSync(__dirname + '/tmp/') || fs.mkdirSync(__dirname + '/tmp');

  rimraf(__dirname + '/tmp/blocks');
  rimraf(__dirname + '/tmp/stories/*');

  generateColorsBlocks();
  buildBlocks();
  buildDocs();
};
