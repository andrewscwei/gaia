import * as turf from '@turf/turf';
import _ from 'lodash';
import GeoDistance from './GeoDistance';

export default class GeoCoordinate {
  static validateLongitude(longitude: number): boolean {
    if (longitude < -180) return false;
    if (longitude > 180) return false;
    return true;
  }

  static validateLatitude(latitude: number): boolean {
    if (latitude < -90) return false;
    if (latitude > 90) return false;
    return true;
  }

  static isValidDescriptor<T>(value: T): value is NonNullable<T> {
    if (GeoCoordinate.isValid(value)) return true;

    if (_.isArray(value)) {
      try {
        const coord = GeoCoordinate.fromArray(value);
        return true;
      }
      catch (err) {
        return false;
      }
    }
    else if (_.isPlainObject(value)) {
      try {
        const coord = GeoCoordinate.fromPlainObject(value);
        return true;
      }
      catch (err) {
        return false;
      }
    }

    return false;
  }

  static normalizeLongitude(longitude: number): number {
    let lng = longitude;

    while (lng < -180) lng += 360;
    while (lng > 180) lng -= 360;

    return lng;
  }

  static normalizeLatitude(latitude: number): number {
    let lat = latitude;

    while (lat < -90) lat += 180;
    while (lat > 90) lat -= 180;

    return lat;
  }

  static isValid(value: any): value is GeoCoordinate {
    return value instanceof GeoCoordinate;
  }

  static random(): GeoCoordinate {
    return GeoCoordinate.randomWithin();
  }

  static randomWithin(bounds: number[] = [-180, -90, 180, 90]): GeoCoordinate {
    return new GeoCoordinate(_.random(bounds[0], bounds[2], true), _.random(bounds[1], bounds[3], true));
  }

  static randomFrom(coord: GeoCoordinate, distance: GeoDistance | number, steps: number = 64): GeoCoordinate {
    const d = _.isNumber(distance) ? new GeoDistance(distance, 'meters') : distance;
    const circle = turf.circle(turf.point(coord.toArray()), d.meters, { steps, units: 'meters' });
    const coords = _.flatten(turf.getCoords(circle));

    return GeoCoordinate.fromArray(coords[_.random(0, coords.length - 1)]);
  }

  static fromString(str: string): GeoCoordinate {
    const parsed = str.replace(' ', '');
    if (!parsed.startsWith('[')) throw new Error('Invalid string format provided');
    if (!parsed.endsWith(']')) throw new Error('Invalid string format provided');
    const degrees = parsed.substring(1, parsed.length - 1).split(',');
    return GeoCoordinate.fromArray(degrees);
  }

  static fromArray(arr: any[]): GeoCoordinate {
    if (arr.length !== 2) throw new Error('Array must have exactly 2 items');
    return new GeoCoordinate(Number(arr[0]), Number(arr[1]));
  }

  static fromPlainObject(obj: { [key: string]: any }): GeoCoordinate {
    const keys = Object.keys(obj);
    if (!~keys.indexOf('longitude')) throw new Error('Plain object is missing `longitude` key');
    if (!~keys.indexOf('latitude')) throw new Error('Plain object is missing `latitude` key');
    return new GeoCoordinate(Number(obj.longitude), Number(obj.latitude));
  }

  static make(value?: any): GeoCoordinate {
    if (GeoCoordinate.isValid(value)) return new GeoCoordinate(value.longitude, value.latitude);
    if (_.isNil(value)) return GeoCoordinate.random();
    if (_.isString(value)) return GeoCoordinate.fromString(value);
    if (_.isArray(value)) return GeoCoordinate.fromArray(value);
    if (_.isPlainObject(value)) return GeoCoordinate.fromPlainObject(value);

    throw new Error(`Unable to make GeoCoordinate instance from value ${value}`);
  }

  readonly longitude: number;
  readonly latitude: number;

  constructor(longitude: number, latitude: number) {
    this.longitude = GeoCoordinate.normalizeLongitude(longitude);
    this.latitude = GeoCoordinate.normalizeLatitude(latitude);
  }

  isInsideGeoJson(...geoJsons: turf.AllGeoJSON[]): boolean {
    const selfGeoJson = this.toGeoJson();

    for (const geoJson of geoJsons) {
      const featureCollection = turf.flatten(geoJson);

      for (const feature of featureCollection.features) {
        if (turf.booleanWithin(selfGeoJson, feature)) {
          return true;
        }
      }
    }

    return false;
  }

  toString(): string {
    return `[${this.longitude},${this.latitude}]`;
  }

  toArray(): number[] {
    return [this.longitude, this.latitude];
  }

  toPlainObject(): { longitude: number; latitude: number; } {
    return {
      longitude: this.longitude,
      latitude: this.latitude,
    };
  }

  toGeoJson() {
    return turf.point(this.toArray());
  }
}
