import {
  Decorator,
  CallExpression,
  Identifier,
  ObjectExpression,
  KeyValueProperty,
  TsType,
  ArrayExpression,
  StringLiteral,
  ModuleItem,
} from '@swc/core';
import { Visitor } from '@swc/core/Visitor.js';
import {
  createArrayExpression,
  createExpressionStatement,
  createIdentifer,
  createStringLiteral,
  createKeyValueProperty,
  createTemplateLiteral,
  createTemplateElement,
} from 'swc-ast-helpers';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

export class AngularComponents extends Visitor {
  constructor(private sourceUrl: string) {
    super();
  }
  override visitModuleItems(items: ModuleItem[]): ModuleItem[] {
    return items.flatMap((item) => this.visitModuleItem(item));
  }

  override visitDecorator(decorator: Decorator) {
    if (
      decorator.expression.type === 'CallExpression' &&
      (
        (decorator.expression as unknown as CallExpression)
          ?.callee as Identifier
      ).value === 'Component'
    ) {
      return {
        ...decorator,
        expression: {
          ...(decorator.expression as CallExpression),
          arguments: (decorator.expression as CallExpression).arguments.map(
            (arg) => {
              return {
                ...arg,
                expression: {
                  ...arg.expression,
                  properties: (
                    arg.expression as ObjectExpression
                  ).properties.map((prop) => {
                    if (
                      ((prop as KeyValueProperty).key as Identifier).value ===
                      'templateUrl'
                    ) {
                      const actualImportPath = join(
                        dirname(this.sourceUrl),
                        ((prop as KeyValueProperty).value as Identifier).value
                      );
                      const templateContent = readFileSync(
                        actualImportPath,
                        'utf8'
                      );

                      return createKeyValueProperty(
                        createIdentifer('template'),
                        createTemplateLiteral([
                          createTemplateElement(templateContent),
                        ])
                      );
                    }

                    if (
                      ((prop as KeyValueProperty).key as Identifier).value ===
                      'styleUrls'
                    ) {
                      const contents = (
                        (prop as KeyValueProperty).value as ArrayExpression
                      ).elements.map((el) => {
                        const actualImportPath = join(
                          dirname(this.sourceUrl),
                          (el?.expression as StringLiteral).value
                        );
                        return readFileSync(actualImportPath, 'utf8');
                      });
                      return {
                        ...prop,
                        key: createIdentifer('styles'),
                        value: createArrayExpression(
                          contents.map((c) =>
                            createExpressionStatement(createStringLiteral(c))
                          )
                        ),
                      };
                    }
                    return prop;
                  }),
                } as ObjectExpression,
              };
            }
          ),
        },
      };
    }
    return decorator;
  }

  override visitTsTypes(nodes: TsType[]): TsType[] {
    return nodes;
  }

  override visitTsType(nodes: TsType): TsType {
    return nodes;
  }
}
