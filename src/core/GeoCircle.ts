import * as turf from '@turf/turf'
import _ from 'lodash'
import GeoCoordinate from './GeoCoordinate'
import GeoDistance from './GeoDistance'

export default class GeoCircle {
  readonly center: GeoCoordinate
  readonly radius: GeoDistance

  constructor(center: GeoCoordinate, radius: GeoDistance) {
    this.center = center
    this.radius = radius
  }

  static isValidDescriptor<T>(value: T): value is NonNullable<T> {
    if (GeoCircle.isValid(value)) return true

    if (_.isPlainObject(value)) {
      try {
        GeoCircle.fromPlainObject(value)
        return true
      }
      catch (err) {
        return false
      }
    }

    return false
  }

  static isValid(value: any): value is GeoCircle {
    return value instanceof GeoCircle
  }

  static fromPlainObject(object: { [key: string]: any }): GeoCircle {
    const keys = Object.keys(object)
    if (!~keys.indexOf('center')) throw new Error('Plain object is missing `center` key')
    if (!~keys.indexOf('radius')) throw new Error('Plain object is missing `radius` key')

    return new GeoCircle(GeoCoordinate.fromPlainObject(object.center), new GeoDistance(parseFloat(object.radius)))
  }

  static fromCoordinates(coordinates: GeoCoordinate[]): GeoCircle {
    const coords = coordinates.map(coord => coord.toArray())
    const points = coords.map(coord => turf.point(coord))
    const center = GeoCoordinate.make(turf.getCoords(turf.center(turf.featureCollection(points))))

    if (!center) throw new Error('Unable to calculate the center of the coordinates')

    let distance = 0

    for (const coord of coordinates) {
      const d = GeoDistance.between(center, coord)
      if (d.meters > distance) distance = d.meters
    }

    return GeoCircle.make(center, distance)
  }

  static fromCircles(circles: GeoCircle[], steps = 64): GeoCircle {
    if (circles.length === 1) return circles[0]

    const coords = _.flatten(circles.map(circle => circle.getBounds(steps))).map(coord => coord.toArray())
    const points = coords.map(coord => turf.point(coord))
    const center = GeoCoordinate.make(turf.getCoords(turf.center(turf.featureCollection(points))))

    if (!center) throw new Error('Unable to calculate the center of the coordinates')

    let distance = 0

    for (const circle of circles) {
      const d = GeoDistance.between(center, circle.center).meters + circle.radius.meters
      if (d > distance) distance = d
    }

    return GeoCircle.make(center, distance)
  }

  static make(center: any, radius: any): GeoCircle {
    const c = GeoCoordinate.make(center)

    if (!c) throw new Error(`Unable to determine center coordinate from value ${center}`)

    const r = GeoDistance.make(radius)

    if (!r) throw new Error(`Unable to determine radius from value ${radius}`)

    return new GeoCircle(c, r)
  }

  isInsideGeoJson(...geoJsons: turf.AllGeoJSON[]): boolean {
    const selfGeoJson = this.toGeoJson()

    for (const geoJson of geoJsons) {
      const featureCollection = turf.flatten(geoJson)

      for (const feature of featureCollection.features) {
        if (turf.booleanWithin(selfGeoJson, feature)) {
          return true
        }
      }
    }

    return false
  }

  getBounds(steps = 64): GeoCoordinate[] {
    if (this.radius.meters > 0) {
      const circle = turf.circle(turf.point(this.center.toArray()), this.radius.meters, {
        steps,
        units: 'meters',
      })

      const coords = _.flatten(turf.getCoords(circle))

      return coords.map(coord => new GeoCoordinate(coord[0], coord[1]))
    }
    else {
      return [this.center]
    }
  }

  toPlainObject(): { center: { longitude: number; latitude: number }; radius: number } {
    return {
      center: this.center.toPlainObject(),
      radius: this.radius.meters,
    }
  }

  toGeoJson(steps = 64) {
    return turf.circle(turf.point(this.center.toArray()), this.radius.meters, { steps, units: 'meters' })
  }
}
