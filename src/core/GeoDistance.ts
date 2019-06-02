import { degreesToRadians, lengthToDegrees, lengthToRadians, radiansToDegrees, radiansToLength } from '@turf/helpers';
import { distance } from '@turf/turf';
import _ from 'lodash';
import { NumericalSystem, NumericalUnits } from '../types';
import GeoCoordinate from './GeoCoordinate';

export default class GeoDistance {
  static between(coord1: GeoCoordinate, coord2: GeoCoordinate): GeoDistance {
    const units = 'meters';
    return new GeoDistance(distance(coord1.toArray(), coord2.toArray(), { units }), units);
  }

  static random(from: number, to: number, units: NumericalUnits = 'meters'): GeoDistance {
    return new GeoDistance(_.random(from, to, true), units);
  }

  static make(value: any, units: NumericalUnits = 'meters'): GeoDistance {
    if (_.isNumber(value)) return new GeoDistance(value, units);
    if (value instanceof GeoDistance) return new GeoDistance(value.meters, 'meters');

    if (_.isString(value)) {
      const float = parseFloat(value);

      if (isNaN(float)) throw new Error(`Unable to create a new Distance instance from value ${float}`);

      return new GeoDistance(float, units);
    }

    throw new Error(`Unsupported value ${value}`);
  }

  readonly meters: number;
  readonly kilometers: number;
  readonly miles: number;
  readonly nauticalMiles: number;
  readonly degrees: number;
  readonly radians: number;
  readonly inches: number;
  readonly yards: number;

  constructor(value: number, units: NumericalUnits = 'meters') {
    switch (units) {
    case 'kilometers':
    case 'kilometres':
      this.meters = value * 1000;
      this.kilometers = value;
      this.miles = value * 0.62137119;
      this.nauticalMiles = value * 0.53995680;
      this.yards = value * 1093.6133;
      this.inches = value * 39370.079;
      this.degrees = lengthToDegrees(value, 'kilometers');
      this.radians = lengthToRadians(value, 'kilometers');
    case 'miles':
      this.meters = value * 1609.344;
      this.kilometers = value * 1.609344;
      this.miles = value;
      this.nauticalMiles = value * 0.86897624;
      this.yards = value * 1760;
      this.inches = value * 63360;
      this.degrees = lengthToDegrees(value, 'miles');
      this.radians = lengthToRadians(value, 'miles');
    case 'nauticalmiles':
      this.meters = value * 1852;
      this.kilometers = value * 1.852;
      this.miles = value * 1.1507794;
      this.nauticalMiles = value;
      this.yards = value * 2025.3718;
      this.inches = value * 72913.386;
      this.degrees = lengthToDegrees(value, 'nauticalmiles');
      this.radians = lengthToRadians(value, 'nauticalmiles');
    case 'inches':
      this.meters = value * 0.0254;
      this.kilometers = value * 2.54 * 1e-5;
      this.miles = value * 1.5782828 * 1e-5;
      this.nauticalMiles = value * 1.3714903 * 1e-5;
      this.yards = value * 0.027777778;
      this.inches = value;
      this.degrees = lengthToDegrees(value, 'inches');
      this.radians = lengthToRadians(value, 'inches');
    case 'yards':
      this.meters = value * 0.9144;
      this.kilometers = value * 0.0009144;
      this.miles = value * 0.00056818182;
      this.nauticalMiles = value * 0.00049373650;
      this.yards = value;
      this.inches = value * 36;
      this.degrees = lengthToDegrees(value, 'yards');
      this.radians = lengthToRadians(value, 'yards');
    case 'radians':
      this.meters = radiansToLength(value, 'meters');
      this.kilometers = radiansToLength(value, 'kilometers');
      this.miles = radiansToLength(value, 'miles');
      this.nauticalMiles = radiansToLength(value, 'nauticalmiles');
      this.yards = radiansToLength(value, 'yards');
      this.inches = radiansToLength(value, 'inches');
      this.degrees = radiansToDegrees(value);
      this.radians = value;
    case 'degrees':
      this.meters = radiansToLength(degreesToRadians(value), 'meters');
      this.kilometers = radiansToLength(degreesToRadians(value), 'kilometers');
      this.miles = radiansToLength(degreesToRadians(value), 'miles');
      this.nauticalMiles = radiansToLength(degreesToRadians(value), 'nauticalmiles');
      this.yards = radiansToLength(degreesToRadians(value), 'yards');
      this.inches = radiansToLength(degreesToRadians(value), 'inches');
      this.degrees = value;
      this.radians = degreesToRadians(value);
    default:
      this.meters = value;
      this.kilometers = value / 1000;
      this.miles = value * 0.00062137;
      this.nauticalMiles = value * 0.00053995680;
      this.yards = value * 1.0936;
      this.inches = value * 39.370;
      this.degrees = lengthToDegrees(value, 'meters');
      this.radians = lengthToRadians(value, 'meters');
    }
  }

  toString(system: NumericalSystem = 'metric'): string {
    switch (system) {
    case 'imperial':
      if (this.yards >= 1760) {
        return `${parseFloat((this.yards / 1760).toFixed(1)).toLocaleString()} mi`;
      }
      else {
        return `${Math.round(this.yards).toLocaleString()} yd`;
      }
    default:
      if (this.meters >= 1000) {
        return `${parseFloat((this.meters / 1000).toFixed(1)).toLocaleString()} km`;
      }
      else {
        return `${Math.round(this.meters).toLocaleString()} m`;
      }
    }
  }
}
