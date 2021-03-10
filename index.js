const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())


app.get('/', (request, response) => {
  response.send('<h1>test</h1>')
})

app.get('/api/craigslistsearch', (request, response) => { 

  const newNightmareInstance = () => {
    const Nightmare = require('nightmare')
    const nightmare = Nightmare({  openDevTools: {
        mode: 'detach'
      },
      show: false,
    })

    return nightmare
  }

  const nightmare = newNightmareInstance()

  console.log("received request");
  const searchTerm = 'fender stratocaster'
  const craigslistLocation = 'seattle'
  
nightmare
  .goto(`https://${craigslistLocation}.craigslist.com`)
  .wait('#query')
  .insert('#query', searchTerm)
  .click('#go')
  .wait('#sortable-results')
  .evaluate( () => {
    var allResults = []
    const rows = document.querySelector('#sortable-results').querySelectorAll('.result-row')

    const updateResult = (result, property, value) => {
      if (!value) {
        return {...result, [property]: null}
      } else if (property === 'price') {
        return {...result, [property]: value.replace(/,/i,'').replace(/\$/i,'')}
      } else if (property === 'location') {
        return {...result, [property]: value.replace('(','').replace(')','')}
      } else {
        return {...result, [property]: value}
      }
    }

    rows.forEach( row => {
      var result = {}
      result = updateResult(result, 'link', row.querySelector('.result-image')
                ? row.querySelector('.result-image').href
                : null
                )
      result = updateResult(result, 'img', row.querySelector("img")
                ? row.querySelector("img").src
                : null
                )
      result = updateResult(result, 'date', row.querySelector('.result-date')
                ? row.querySelector('.result-date').innerText
                : null
                )
      result = updateResult(result, 'title', row.querySelector('.result-title')
                ? row.querySelector('.result-title').innerText
                : null
                )
      result = updateResult(result, 'id', row.querySelector('.result-title')
                ? row.querySelector('.result-title').id
                : null
                )
      result = updateResult(result, 'price', row.querySelector('.result-price')
                ? row.querySelector('.result-price').innerText
                : null
                )
      result = updateResult(result, 'location', row.querySelector('.result-hood')
                ? row.querySelector('.result-hood').innerText
                : null
                )
      
      allResults.push(result)
    })
      
    return JSON.stringify(allResults)

  })
  .end()
  .then((evaluation) => {
    console.log("ran nightmare");
    const obj = {
      results: JSON.parse(evaluation),
    }

    response.json(obj)
  })
  .catch(error => {
  console.error('Search failed:', error)
  response.json(error)
  })   

})



app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})