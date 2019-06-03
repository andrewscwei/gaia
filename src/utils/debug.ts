import _ from 'lodash';
import { GeoCircle, GeoCoordinate } from '../core';

const debug = require('debug')('gaia');

export function printCircleBounds(circle: GeoCircle, stripSymbols: boolean = false, useConsole: boolean = false) {
  printCoordinates(circle.getBounds(), stripSymbols, useConsole);
}

export function printMultipleCircleBounds(circles: GeoCircle[], stripSymbols: boolean = false, useConsole: boolean = false) {
  const coordinates = _.flatten(circles.map(circle => circle.getBounds()));
  printCoordinates(coordinates, stripSymbols, useConsole);
}

export function printCoordinate(coordinate: GeoCoordinate, stripSymbols: boolean = false, useConsole: boolean = false) {
  // tslint:disable-next-line: no-console
  const loggerFunc = useConsole ? console.log : debug;

  if (stripSymbols) {
    loggerFunc(`${coordinate.longitude},${coordinate.latitude}`);
  }
  else {
    loggerFunc(coordinate.toString());
  }
}

export function printCoordinates(coordinates: GeoCoordinate[], stripSymbols: boolean = false, useConsole: boolean = false) {
  // tslint:disable-next-line: no-console
  const loggerFunc = useConsole ? console.log : debug;

  if (stripSymbols) {
    for (const coordinate of coordinates) {
      printCoordinate(coordinate, stripSymbols, useConsole);
    }
  }
  else {
    loggerFunc(coordinates.map(c => c.toString()));
  }
}
