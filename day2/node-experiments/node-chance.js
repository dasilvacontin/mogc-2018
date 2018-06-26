const Chance = require('chance')
const chance = new Chance()

console.log(chance.d100())
console.log(chance.birthday())
console.log(chance.address())
console.log(chance.name())
console.log(chance.animal({type: 'pet'}))
