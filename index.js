const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())


app.get('/', (request, response) => {
  response.send('<h1>test</h1>')
})

app.get('/api/craigslistsearch', (request, response) => {
  if (!request.query.search) {
    console.log("No query");
    return response.json({ results: [] })
  }

  const searchQuery = JSON.parse(request.query.search)
  const price = JSON.parse(request.query.price)
  const { term } = searchQuery

  console.log("price", price);

  const newNightmareInstance = () => {
    const Nightmare = require('nightmare')
    const nightmare = Nightmare({  openDevTools: {
        mode: 'detach'
      },
      show: false,
    })

    return nightmare
  }

  if (term) {
    const nightmare = newNightmareInstance()
    nightmare
      //.goto(`https://${craigslistLocation}.craigslist.com`)
      .goto(`https://geo.craigslist.com`)
      .wait('#query')
      .insert('#query', term)
      .click('#go')
      .wait('.search-options-container')
      .insert("input[name='min_price']", price.min)
      .insert("input[name='max_price']", price.max)
      .click("button[type='submit']")
      .wait('#sortable-results')
      .evaluate( () => {
        var allResults = []
        const rows = document.querySelector('#sortable-results').querySelectorAll('.result-row')
        console.log("results", document.querySelector('#sortable-results').querySelectorAll('.result-row'));

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
      //.end()
      .then((evaluation) => {
        console.log("ran nightmare");
        const obj = {
          results: JSON.parse(evaluation),
        }

        return response.json(obj)
      })
      .catch(error => {
      console.error('Search failed:', error)
      return response.json(error)
      })   
  } else {

    return response.json({ results: [] })
  }
})
  




app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})