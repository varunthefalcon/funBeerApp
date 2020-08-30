import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { ReactComponent as BeerLoader1 } from './assets/beer1.svg'
import { ReactComponent as BeerLoader2 } from './assets/beer2.svg'
import { ReactComponent as BeerLoader3 } from './assets/beer3.svg'
import { ReactComponent as BeerLoader4 } from './assets/beer4.svg'

const CORS_API = 'https://cors-anywhere.herokuapp.com/'
const API_ENDPOINT = CORS_API + 'https://sandbox-api.brewerydb.com/v2/beers'
// endpoint /beer/random doesnt return labels even though hasLabels is set to Y. Weird ;-/
const API_KEY = process.env.REACT_APP_API_KEY

const beerLoaders = [BeerLoader1, BeerLoader2, BeerLoader3, BeerLoader4]
const loadingMsgs = [
  'Brewing your beer! Please wait...',
  'Prost! Prost! Prost!',
  'Sláinte! Sláinte! Sláinte!',
  'Dont be afraid of Dark, Guinness for life...',
  'Drink Responsibly'
]

function Beer() {

  const [beerData, setBeerData] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [showingBeer, setShowingBeer] = useState(true)

  const toggleShowingBeer = () => {
    setShowingBeer(!showingBeer)
  }

  const config = {
    method: 'GET',
    url: API_ENDPOINT,
    params: {
      key: API_KEY,
      order: 'random',
      randomCount: 1,
      withBreweries: 'Y',
      withIngredients: 'Y',
      hasLabels: 'Y',
    }
  }
  const getRandomBeer = async () => {
    setShowingBeer(true)
    setApiError(false)
    try {
      setApiLoading(true)
      const response = await Axios(config)
      setBeerData(response.data.data[0])  // since count is set to 1
      setApiLoading(false)
    } catch (error) {
      console.error(error)
      alert('Drunk coder did something, please try again later.')
      setApiError(true)
    }
  }

  // eslint-disable-next-line
  useEffect(() => {getRandomBeer()}, [])

  const beerInfo = cleanUp(beerData)

  if (apiLoading || apiError) {
    return <Loader apiError={apiError} reloadApi={getRandomBeer} />
  }
  let { beerName, description, image, brewery = {}, hops = [], malt = [] } = beerInfo || {}

  const { images = {}, locations = [], established= 'N/A', website = 'N/A' } = brewery;

  if (!showingBeer) {
    beerName = brewery.name;
    description = brewery.description;
    image = images.large || images.medium
  }

  return <>
    <div className='container'>
      <div className='navWrapper'>
        <h1>THE RANDOM BEER APP</h1>
        <button onClick={getRandomBeer}>Guess My Beer</button>
      </div>
      {!showingBeer && <div><span className='cursorPointer' onClick={toggleShowingBeer}>&lt;&lt; Back</span></div>}
      <div className='main'>
        <div className='imgWrapper'>
          <img src={image} alt={beerName} />
        </div>
        <div className='contentWrapper'>
          <div>
            <div className='beerTitle'>
              <h2>{beerName}</h2>
              <hr />

            </div>
            <div className='beerContent'>
              <p className='beerDesc'>{description}</p>
            </div>
          </div>
          <div className='beerBrewery'>
            {showingBeer && <>
              <p><span><b>Brewery :  </b></span><span className='breweryLink' onClick={toggleShowingBeer}>{brewery.name}</span></p>
              <p><b>Ingredients :  </b> {!hops.length && !malt.length && 'N/A'} </p>
              <GetIngredients label='Hops' items={hops} />
              <GetIngredients label='Malt' items={malt} />
            </>}
            {!showingBeer && <>
              <p><b>Since :  </b> {established} </p>
              <p><b>Website :  </b> {website} </p>
              <p><b>Locations :  </b> {!locations.length && 'N/A'} </p>
              <GetIngredients label='' items={locations} />
            </>}
          </div>

        </div>
      </div>
    </div>
    {/* <div className='footer'>
            <small>Drink Responsibly</small>
            </div> */}
  </>
}

export default Beer;

const cleanUp = (data = {}) => {

  const { id, name: beerName, style = {}, labels = {}, breweries = [], ingredients = {} } = data || {}
  if (!id) return ({})

  const { hops = [], malt = [] } = ingredients
  const image = labels.large || labels.medium
  const description = style.description
  const brewery = breweries[0]

  return { beerName, description, image, brewery, hops, malt }
}

const Loader = ({apiError, reloadApi}) => {
  const BeerLoader = beerLoaders[Math.floor(Math.random() * beerLoaders.length)];
  const loadMessage = loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
  return <div className='loaderWrapper'>
        <BeerLoader />
        {loadMessage}
        {!!apiError && <p className='cursorPointer' onClick={reloadApi}>;-/ Lets retry... click here</p>}
        </div>
}

const GetIngredients = (props) => {
  const { items = [], label } = props
  const ingredients = items.map(e => e.name).join(', ')
  return items.length > 0 && <p><span>{label && <b>{label} :  </b>}</span> {ingredients} </p>
}
