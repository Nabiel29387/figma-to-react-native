import {generateComponent} from 'modules/generate/react-native/component';
import {generatePreview} from 'modules/generate/react-native/preview';
import {generateStory} from 'modules/generate/react-native/story';
import {parseStyles} from 'modules/parse/styles';
import {parseNodes} from 'modules/parse/nodes';
import {getName, propsToString} from 'utils/figma';

import type {EditorComponent, EditorLinks} from 'types/editor';
import type {ParsedComponent} from 'types/parse';
import type {TargetNode} from 'types/figma';
import type {Settings} from 'types/settings';

export function generateBundle(component: TargetNode, settings: Settings, noPreview?: boolean): EditorComponent {
  if (!component) {
    return {name: '', props: '',  code: '', story: '', preview: '', links: {}};
  }

  const isVariant = !!component.variantProperties;
  const masterNode = isVariant ? component?.parent : component;
  const children = parseNodes([...component.children]);
  const props = propsToString(masterNode?.componentPropertyDefinitions);
  const links: EditorLinks = {};
  const root: ParsedComponent = {
    id: component.id,
    tag: 'View',
    slug: 'root',
    node: component,
    name: getName(masterNode.name),
    styles: parseStyles(component, true),
  };

  Object.entries(children.state.components).forEach((c: any) => {
    links[getName(c[1].name)] = c[0];
  });

  return {
    props,
    links,
    name: root.name,
    code: generateComponent(root, children, settings),
    story: generateStory(root, settings),
    preview: !noPreview ? generatePreview(root, children, settings) : '',
  };
}
