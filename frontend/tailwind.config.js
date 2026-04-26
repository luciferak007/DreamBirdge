export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { brand: { 50:'#eef4ff',100:'#dbe6ff',500:'#4f7cff',600:'#3b63e6',700:'#2f4fbd' } },
    backgroundImage: { 'gradient-mesh': 'radial-gradient(at 20% 20%, #c4d4ff 0, transparent 50%), radial-gradient(at 80% 0%, #e0d4ff 0, transparent 50%), radial-gradient(at 80% 100%, #ffd4ec 0, transparent 50%)' }
  } },
  plugins: []
}
