'use strict';

const mdx = require('@mdx-js/mdx');
const babel = require('babel-core');
// const link = require('rehype-autolink-headings');
const slug = require('rehype-slug');

class MdxPlugin {
    constructor(config) {
        this.config = (config.plugins && config.plugins.mdx) ? config.plugins.mdx : {};
        this.pattern = (this.config.pattern == null) ? /\.(mdx)$/ : this.config.pattern;
    }

    compile(file) {
        return new Promise((resolve, reject) => {
            const mdxOptions = {
                hastPlugins: [slug],
            };

            mdx(file.data, mdxOptions).then((mdxCompiled) => {
                const jsxCode = `
                import React from 'react';
                import { MDXTag } from '@mdx-js/tag';
                ${mdxCompiled}
                `;

                let compiled;

                const babelOptions = {
                    filename: file.path,
                    sourceFileName: file.path,
                    sourceMap: true,
                };

                try {
                    compiled = babel.transform(jsxCode, babelOptions);
                } catch (error) {
                    reject(error);
                    return;
                }

                const result = {data: compiled.code || compiled};

                result.data += '\n';
                if (compiled.map) result.map = JSON.stringify(compiled.map);

                resolve(result);

            }).catch(error => reject(error));
        });

    }
}

MdxPlugin.prototype.brunchPlugin = true;
MdxPlugin.prototype.type = 'javascript';

module.exports = MdxPlugin;
