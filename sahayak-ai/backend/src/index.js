import dotenv from 'dotenv'
import { createApp, getDefaultModelList } from './app.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const models = getDefaultModelList()
const app = createApp({ models })

app.listen(PORT, () => {
  console.log(`ClassBridge app running on http://localhost:${PORT}`)
  console.log(`Gemini fallback models: ${models.join(', ')}`)
})
