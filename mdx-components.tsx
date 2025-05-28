import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/ui/tabs";
import * as StepsComponents from "fumadocs-ui/components/steps";
import * as CalloutComponents from "fumadocs-ui/components/callout";
import * as DynamicCodeBlockComponents from 'fumadocs-ui/components/dynamic-codeblock';

import type { MDXComponents } from "mdx/types";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...StepsComponents,
    ...CalloutComponents,
    ...DynamicCodeBlockComponents,
    ...components
  };
}
