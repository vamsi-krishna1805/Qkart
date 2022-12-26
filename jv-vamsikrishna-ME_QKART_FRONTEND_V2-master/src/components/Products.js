import { Search, SentimentDissatisfied } from '@mui/icons-material'
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material'
import { Box } from '@mui/system'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { config } from '../App'
import Footer from './Footer'
import Header from './Header'
import './Products.css'
import ProductCard from './ProductCard'

import Cart, { generateCartItemsFrom } from './Cart'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'


/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */


const Products = () => {

  
  
  const [paginationCheck, setPaginationCheck] = useState(true)
  const [allProducts, setAllProducts] = useState([])
  const { enqueueSnackbar } = useSnackbar()
  const [items, setItems] = useState([])
  const [debounceTimeout, setDebounceTimeout] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])

  const token = localStorage.getItem('token')

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setLoading(true)

    try {
      const response = await axios.get(`${config.endpoint}/products`)

      setLoading(false)
      setAllProducts(response.data)
      let productsAccToPagintionOnStart = paginate(response.data, 12, 1)
      setProducts(productsAccToPagintionOnStart)
      setFilteredProducts(productsAccToPagintionOnStart)

      return productsAccToPagintionOnStart
    } catch (e) {
      setLoading(false)

      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: 'error' })
        return null
      } else {
        enqueueSnackbar(
          'Could not fetch products. Check that the backend is running, reachable and returns valid JSON.',
          {
            variant: 'error',
          },
        )
      }
    }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`,
      )
      setFilteredProducts(response.data)
      return response.data
    } catch (e) {
      if (e.response) {
        if (e.response.status === 404) {
          setFilteredProducts([])
        }

        if (e.response.status === 500) {
          enqueueSnackbar(e.response.data.message, { variant: 'error' })
          setFilteredProducts(products)
        }
      } else {
        enqueueSnackbar(
          'Could not fetch products. Check that the backend is running, reachable and returns valid JSON.',
          {
            variant: 'error',
          },
        )
      }
    }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const timeout = setTimeout(() => {
      performSearch(value)
    }, 500)

    setDebounceTimeout(timeout)
  }

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data

    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: 'error' })
      } else {
        enqueueSnackbar(
          'Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.',
          {
            variant: 'error',
          },
        )
      }
      return null
    }
  }

  const updateCartItems = (cartData, products) => {
    const cartItems = generateCartItemsFrom(cartData, products)
    setItems(cartItems)
  }
  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {

    if (items) {
      return items.findIndex((item) => item.productId === productId) !== -1
    }

  }

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    stock,
    options = { preventDuplicate: false },
  ) => {

    if (
      qty > 5 &&
      (productId === '3CRwjF7lN97HnEa' || productId === '4CRwjF7lN97HnEa')
    ) {
      alert('You cannot order more than 5 of this product')

      return
    }

    if (stock === 0) {
      alert('The given product is out of stock')
      return
    }
    if (!token) {
      enqueueSnackbar('Login to add an item to the Cart', {
        variant: 'warning',
      })
      return
    }

    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar(
        'Item already in cart. Use the cart sidebar to update quantity or remove item.',
        {
          variant: 'warning',
        },
      )
      return
    }

    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      updateCartItems(response.data, products)
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: 'error' })
      } else {
        enqueueSnackbar(
          'Could not fetch products. Check that the backend is running, reachable and returns valid JSON.',
          {
            variant: 'error',
          },
        )
      }
    }
  }
  
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await performAPICall()
      const cartData = await fetchCart(token)
      const cartDetails = await generateCartItemsFrom(cartData, productsData)
      setItems(cartDetails)
    }
    onLoadHandler()
  }, [])
  useEffect(() => {
    filteredProducts?.length < 12
      ? setPaginationCheck(false)
      : setPaginationCheck(true)
  }, [paginationCheck, filteredProducts])
  function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size)
  }

  const [page, setPage] = React.useState(1)
  const handleChange = (event, value) => {
    setPage(value)
    let productsAccToPagintion = paginate(allProducts, 12, value)
    setProducts(productsAccToPagintion)
    setFilteredProducts(productsAccToPagintion)
  }

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: 'search',
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounceTimeout)}
        />
      </Header>
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTimeout)}
      />
      <Grid container>
        <Grid
          item
          xs={12}
          md={token && allProducts.length ? 9 : 12}
          className="product-grid"
        >
          <Box className="hero">
            <p className="hero-heading">
              India’ s
              <span className="hero-highlight"> FASTEST DELIVERY </span> to your
              door step
            </p>
          </Box>
          {isLoading ? (
            <Box className="loading">
              <CircularProgress />
              <h4> Loading Products... </h4>
            </Box>
          ) : (
            <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <Grid item xs={6} md={3} key={product._id}>
                    <ProductCard
                      product={product}
                      handleAddToCart={async () => {
                        await addToCart(
                          token,
                          items,
                          products,
                          product._id,
                          1,
                          product.stock,
                          {
                            preventDuplicate: true,
                          },
                        )
                      }}
                    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4 style={{ color: '#636363' }}> No products found </h4>{' '}
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {token ? (
          <Grid item xs={12} md={3} bgcolor="#E9F5E1">
            <Cart
              hasCheckoutButton
              products={products}
              items={items}
              handleQuantity={addToCart}
            />
          </Grid>
        ) : null}
      </Grid>
      {paginationCheck && allProducts.length > 12 ? (
        <Stack style={{ alignItems: 'center', padding: '20px' }} spacing={2}>
          <Pagination
            count={Math.round(allProducts.length / 12)}
            size="large"
            page={page}
            onChange={handleChange}
          />
        </Stack>
      ) : (
        null
      )}
      <Footer />
    </div>
  )
}

export default Products
