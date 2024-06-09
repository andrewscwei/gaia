import { expect } from 'chai'
import _ from 'lodash'
import { describe, it } from 'mocha'
import { GeoCoordinate } from './GeoCoordinate.js'
import { GeoDistance } from './GeoDistance.js'

describe('GeoCoordinate', () => {
  it('can generate a random coordinate', () => {
    GeoCoordinate.random()
  })

  it('can generate 100 random coordinates from a coordinate', () => {
    let i = 100

    while (i > 0) {
      const origin = GeoCoordinate.random()
      const distance = _.random(0, 1000, true)
      const coord = GeoCoordinate.randomFrom(origin, distance)
      const delta = GeoDistance.between(origin, coord).meters

      expect(Math.abs(distance - delta)).to.be.lt(1.0)

      i--
    }
  })
})
