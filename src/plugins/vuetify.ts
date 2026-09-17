import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#f3f4f6',
          surface: '#ffffff',
          background: '#f5f7fb',
        },
      },
    },
  },
})
