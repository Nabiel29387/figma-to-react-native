import {useState, useEffect} from 'react';
import {build} from 'utils/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings) {
  const [output, setOutput] = useState('');

  
  useEffect(() => {
    if (!component) return;
    
    const appCode = component.preview
      .replace(/import theme from ["']\.\/theme['"];/g, '')
      .replace(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"](\.\/\w+\.tsx?)['"]\s*;/g, '');

    const entryPoint = `
      import {useEffect, useState} from 'react';
      import {AppRegistry} from 'react-native';
      import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';

      ${appCode}

      function Preview() {
        return (
          <TransformComponent wrapperStyle={{height: '100%', width: '100%'}}>
            ${'<' + component.name + ' ' + component.props + '/>'}
          </TransformComponent>
        );
      }

      function Main() {
        return (
          <TransformWrapper centerOnInit>
            <Preview/>
          </TransformWrapper>
        );
      }

      AppRegistry.registerComponent('preview', () => Main);
      AppRegistry.runApplication('preview', {
        rootTag: document.getElementById('preview'),
      });
    `;

    build(entryPoint, settings)
      .then(res => setOutput(res.code
        .replace('stdin_default as default', '')
        .replace('var stdin_default', 'var theme')))
      .catch(err => setOutput(err.toString()));

  }, [component, settings]);

  return output;
}
