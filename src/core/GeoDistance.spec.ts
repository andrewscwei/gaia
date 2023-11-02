import { expect } from 'chai'
import { describe, it } from 'mocha'
import { GeoDistance } from './GeoDistance.js'

describe('GeoDistance', () => {
  it('can stringify meters', () => {
    expect(new GeoDistance(1000).toString()).to.equal('1 km')
    expect(new GeoDistance(1200).toString()).to.equal('1.2 km')
    expect(new GeoDistance(156100000).toString()).to.equal('156,100 km')
    expect(new GeoDistance(900).toString()).to.equal('900 m')
    expect(new GeoDistance(865.234).toString()).to.equal('865 m')
    expect(new GeoDistance(27.8).toString()).to.equal('28 m')
  })
})
