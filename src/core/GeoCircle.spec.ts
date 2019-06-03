import { expect } from 'chai';
import _ from 'lodash';
import { describe, it } from 'mocha';
import GeoCircle from './GeoCircle';
import GeoCoordinate from './GeoCoordinate';
import GeoDistance from './GeoDistance';

describe('GeoCircle', () => {
  it('can create a circle 1000x', () => {
    let count = 0;

    while (count < 1000) {
      const circle = GeoCircle.make(GeoCoordinate.random(), _.random(0, 10000, true));
      expect(circle).to.exist;
      count++;
    }
  });

  it('can compute the minimal enclosing circle of a single circle 1000x', () => {
    let count = 0;

    while (count < 1000) {
      const center = GeoCoordinate.random();
      const radius = GeoDistance.random(0, 10000);
      const circle = GeoCircle.make(center, radius);
      const mec = GeoCircle.fromCircles([circle]);

      expect(GeoDistance.between(center, mec.center).meters, `Center mismatch, ${center.toString()} and ${mec.center.toString()}`).to.be.lt(1.0);
      expect(Math.abs(radius.meters - mec.radius.meters)).to.be.lt(1.0);

      count++;
    }
  });

  it('can compute the minimal enclosing circle of multiple circles 1000x', () => {
    let count = 0;

    while (count < 1000) {
      const circles = [];

      for (let i = 0; i < 10; i++) {
        const center = GeoCoordinate.random();
        const radius = GeoDistance.random(0, 10000);
        const circle = GeoCircle.make(center, radius);
        circles.push(circle);
      }

      const mec = GeoCircle.fromCircles(circles);

      count++;
    }
  });
});
