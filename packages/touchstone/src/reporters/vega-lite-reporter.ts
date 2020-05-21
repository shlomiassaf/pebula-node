import * as FS from 'fs';
import * as Path from 'path';
import { Canvas } from 'canvas';
import { View, parse } from 'vega';
import { TopLevelSpec, compile } from 'vega-lite';
import { LayerSpec } from 'vega-lite/build/src/spec';
import { TopLevel } from 'vega-lite/build/src/spec/base';

import { OnTouchStoneEnd } from '../decorators';
import { TouchStoneEndEvent } from '../runner/events';
import { SuiteResult } from '../result/suite-result';

export type Orientation = 'vertical' | 'horizontal';

/**
 * A reporter that creates visual graphs from the results.
 * Can output html, svg and/or png
 */
export abstract class VegaLiteReporter {

  @OnTouchStoneEnd()
  async onVegaLiteReporterFinalize(event: TouchStoneEndEvent) {
    await this.vegaLiteReporterSaveCharts(event.results.map( suite => {
      const height = suite.cases.length * 50;
      return this.buildGraphData(800, Math.max(600, height), suite);
    }));
  }

  getVegaLiteReporterFileOrientation(): Orientation {
    return 'horizontal';
  }

  getVegaLiteReporterFilename(): string {
    return 'benchmark-chart';
  }

  getVegaLiteReporterFileTypes(): Array<'html' | 'svg' | 'png'> {
    return ['html', 'png', 'svg'];
  }

  protected setOrientation(orientation: Orientation, spec: TopLevel<LayerSpec>) {
    const currentOrientation = (spec.usermeta as any).orientation as Orientation;
    if (orientation !== currentOrientation) {
      if ((orientation === 'horizontal' && currentOrientation === 'vertical') || (orientation === 'vertical' && currentOrientation === 'horizontal')) {
        for (const l of spec.layer) {
          if ('encoding' in l) {
            const { x, x2, y, y2 } = l.encoding;
            for (const a of [x,x2,y,y2] as any) {
              if (a && a.axis && 'labelAngle' in a.axis) {
                if (a.axis.labelAngle === 0) {
                  a.axis.labelAngle = 90;
                } else if (a.axis.labelAngle === 90) {
                  a.axis.labelAngle = 0;
                }
              }
            }
            if (y) {
              l.encoding.x = y as any; // TODO: support width / height swap
            } else {
              delete l.encoding.x;
            }
            if (x) {
              l.encoding.y = x as any; // TODO: support width / height swap
            } else {
              delete l.encoding.y;
            }
            if (x2) {
              l.encoding.y2 = x2 as any; // TODO: support width / height swap
            } else {
              delete l.encoding.y2;
            }
            if (y2) {
              l.encoding.x2 = y2 as any; // TODO: support width / height swap
            } else {
              delete l.encoding.x2;
            }
          }
        }
      }
    }
  }

  protected buildGraphData(width: number, height: number, results: SuiteResult): TopLevel<LayerSpec> {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
      usermeta: { orientation: 'horizontal' as Orientation },
      width,
      height,
      title: `Suite: ${results.name}`,
      data: {
        values: results.cases,
      },
      transform: [
        { flatten: ["hzSamples"], as: ["OPS"] },
        { calculate: "datum.OPS", as: "OPS" }
      ],
      layer: [
        {
          mark: {
            type: "bar",
            clip: true
          },
          encoding: {
            x: {
              field: "OPS",
              type: "quantitative",
              title: "operations / sec",
              aggregate: "max",
              sort: null,
              axis: {
                labelFontSize: 12,
                titleFontSize: 14,
                titleFontWeight: "normal"
              },
              scale: {
                zero: true
              }
            },
            x2: { field: "OPS", aggregate: "min" },
            y: {
              field: "name",
              type: "nominal",
              title: "Cases",
              sort: null,
              axis: {
                labelFontSize: 14,
                labelAngle: 0,
                titleFontSize: 14,
                titleFontWeight: "normal"
              }
            }
          }
        },
        {
          mark: {
            type: "tick",
            opacity: 0.3
          },
          encoding: {
            x: { field: "OPS", type: "quantitative" },
            y: { field: "name", type: "ordinal", sort: null },
            color: {value: "lightgreen" }
          }
        },
        {
          mark: {
            type: "errorbar",
            extent: "stdev",
            ticks: { color: "black" },
            rule: {
              color: "black",
              strokeDash: [ 4, 8 ]
            }
          },
          encoding: {
            x: {
              field: "OPS",
              type: "quantitative"
            },
            y: {field: "name", type: "ordinal", sort: null }
          }
        },
        {
          mark: { type: "point", color: "red", fill: "red" },
          encoding: {
            x: { field: "OPS", type: "quantitative", aggregate: "mean" },
            y: { field: "name", type: "nominal", sort: null }
          }
        },
        {
          mark: { type: "point", color: "white", fill: "white" },
          encoding: {
            x: { field: "OPS", type: "quantitative", aggregate: "median" },
            y: { field: "name", type: "nominal", sort: null }
          }
        }
      ]
    };
  }

  protected async vegaLiteReporterSaveCharts(charts: TopLevel<LayerSpec>[]) {
    const fileName = this.getVegaLiteReporterFilename();
    const filePath = Path.isAbsolute(fileName)
      ? fileName
      : Path.join(process.cwd(), fileName)
    ;

    const views = charts.map( c => {
      this.setOrientation(this.getVegaLiteReporterFileOrientation(), c);
      const vegaSpec = compile(c);
      return new View(parse(vegaSpec.spec), { renderer: 'none' });
    });

    const types = this.getVegaLiteReporterFileTypes();
    const isHtml = types.includes('html');
    const isSvg = types.includes('svg');
    const isPng = types.includes('png');

    if (isHtml || isSvg) {
      const svgCharts = await this.vegaLiteReporterCreateSvgCharts(views);
      if (isHtml) {
        await this.vegaLiteReporterSaveHtml(filePath, charts);
      }
      if (isSvg) {
        await this.vegaLiteReporterSaveSvg(filePath, svgCharts);
      }
    }
  
    if (isPng) {
      const canvas = await this.vegaLiteReporterCreatePngCharts(views);
      await this.vegaLiteReporterSavePng(filePath, canvas);
    }
  }

  protected async vegaLiteReporterCreatePngCharts(views: View[]) {
    let height = 0;
    let width = 0;
    const canvases: Canvas[] = [];
    for (const view of views) {
      const canvas = await view.toCanvas() as any as Canvas;
      height += canvas.height;
      width = Math.max(width, canvas.width);
      canvases.push(canvas);
    }

    const outputCanvas = new Canvas(width, height);
    const ctx = outputCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      ctx.drawImage(canvas, 0, canvas.height * i, canvas.width, canvas.height);
    }

    return outputCanvas;
  }

  protected async vegaLiteReporterCreateSvgCharts(views: View[]) {
    const svgCharts: string[] = [];

    for (const view of views) {
      svgCharts.push(await view.toSVG());
    }

    return svgCharts;
  }

  protected async vegaLiteReporterSavePng(filePath: string, canvas: Canvas) {
    const stream = canvas.createPNGStream();
    const writeStream = FS.createWriteStream(`${filePath}.png`);
    stream.on('data', c => writeStream.write(c) );

    return new Promise<void>( (resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }

  protected async vegaLiteReporterSaveHtml(filePath: string, specs: TopLevelSpec[]) {
    const createEmbeddedSuite = (spec, index) => {
      return `
      <div>
        <div id="vis-${index}"></div>
      </div>
      <div>
        <button id="vis-toggle-orientation-${index}">Toggle Orientation</button>
        <div class="case-checkbox-container">
${spec.data.values.map( (v, i) => `          <div class="case-checkbox"><input type="checkbox" id="vis-checkbox-${i}" checked /><label for="vis-checkbox-${i}">${v.name}</label></div>\n` ).join('')}
        </div>
      </div>
      <script>
        (function(i) {
          function toggleOrientation(spec) {
            for (const l of spec.layer) {
              if ('encoding' in l) {
                const { x, x2, y, y2 } = l.encoding;
                for (const a of [x,x2,y,y2]) {
                  if (a && a.axis && 'labelAngle' in a.axis) {
                    if (a.axis.labelAngle === 0) {
                      a.axis.labelAngle = 90;
                    } else if (a.axis.labelAngle === 90) {
                      a.axis.labelAngle = 0;
                    }
                  }
                }
                if (y) {
                  l.encoding.x = y;
                } else {
                  delete l.encoding.x;
                }
                if (x) {
                  l.encoding.y = x;
                } else {
                  delete l.encoding.y;
                }
                if (x2) {
                  l.encoding.y2 = x2;
                } else {
                  delete l.encoding.y2;
                }
                if (y2) {
                  l.encoding.x2 = y2;
                } else {
                  delete l.encoding.x2;
                }
              }
            }
          }

          const spec = ${JSON.stringify(spec)};
          const liveSpec = Object.assign({}, spec);
          liveSpec.data = { values: spec.data.values.slice() };
          vegaEmbed('#vis-' + i, liveSpec);
          
          document.querySelector('#vis-toggle-orientation-${index}').addEventListener('click', (event) => {
            toggleOrientation(liveSpec);
            vegaEmbed('#vis-' + i, liveSpec);
          });
          spec.data.values.forEach( (v, z) => {
            document.querySelector('#vis-checkbox-' + z).addEventListener('click', (event) => {
              liveSpec.data.values = spec.data.values.filter( (v, q) => {
                return document.querySelector('#vis-checkbox-' + q).checked;
              });
              vegaEmbed('#vis-' + i, liveSpec);
            });
          });
        })(${index});
      </script>`
    }
    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" />
    <script src="https://cdn.jsdelivr.net/npm/vega@5.12.1"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@4.12.2"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6.8.0"></script>
  </head>
  <body>
    <style>
      .case-checkbox-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      .case-checkbox {
        margin: 8px;
        padding: 8px 6px;
        border: 1px solid rgba(0, 0, 0, 0.12);
      }
      .case-checkbox input, .case-checkbox label {
        cursor: pointer;
      }
    </style>   
    <div style="display: flex; flex-direction: row;">
      ${specs.map(createEmbeddedSuite).join('\n')}
    </div>
  </body>
</html>
`;
    FS.writeFileSync(`${filePath}.html`, html, 'utf8');
  }

  protected async vegaLiteReporterSaveSvg(filePath: string, svgCharts: string[]) {
    FS.writeFileSync(`${filePath}.svg`, `<svg>${svgCharts.join('\n')}</svg>`, 'utf8');
  }

}
