import founderLook from '../assets/images/tayf-founder-look.jpg';
import ownerCafe from '../assets/images/photo_6019252689910304549_y.jpg';
import ownerCafeAlt from '../assets/images/photo_6019252689910304550_y.jpg';
import ownerDenim from '../assets/images/photo_6019252689910304544_y.jpg';
import ownerDetail from '../assets/images/photo_6019252689910304551_y.jpg';

const image = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=86`;

export const products = [
  {
    id: 'layl-jacket',
    name: 'Layl layered jacket',
    type: 'Outerwear',
    price: 16800,
    oldPrice: null,
    badge: 'TAYF SIGNATURE',
    colors: ['#765846', '#252522', '#757969'],
    colorNames: ['Date', 'Ink', 'Palm'],
    image: founderLook,
    alternate: founderLook,
    description: 'An easy, softly structured layer with room for everything underneath. Made to move from your Cairo morning to wherever the day goes.'
  },
  {
    id: 'saha-knit',
    name: 'Saha textured knit',
    type: 'Knitwear',
    price: 6900,
    oldPrice: null,
    badge: 'NEW',
    colors: ['#e8dfd2', '#b08b72', '#343530'],
    colorNames: ['Chalk', 'Date', 'Charcoal'],
    image: ownerCafeAlt,
    alternate: ownerCafe,
    description: 'A tactile knit for cool mornings and long evenings, with an easy fit made for layering.'
  },
  {
    id: 'rih-trouser',
    name: 'Rih wide-leg trouser',
    type: 'Trousers',
    price: 5400,
    oldPrice: 6200,
    badge: 'TAYF FAVOURITE',
    colors: ['#34332e', '#d8cfc2', '#7d796d'],
    colorNames: ['Espresso', 'Stone', 'Olive'],
    image: image('photo-1594633312681-425c7b97ccd1'),
    alternate: image('photo-1594633312681-425c7b97ccd1'),
    description: 'A fluid high-rise trouser with generous movement and a full-length line. Easy to pair, comfortable all day.'
  },
  {
    id: 'hawa-shirt',
    name: 'Hawa relaxed shirt',
    type: 'Shirts',
    price: 3900,
    oldPrice: null,
    badge: '',
    colors: ['#f2efe8', '#9b8977', '#2c2c2a'],
    colorNames: ['Ivory', 'Cocoa', 'Black'],
    image: ownerDenim,
    alternate: ownerCafe,
    description: 'A relaxed shape with an easy length. Wear it open, buttoned, or however the day calls for.'
  },
  {
    id: 'nura-set',
    name: 'Nura fluid set',
    type: 'Co-ords',
    price: 8200,
    oldPrice: null,
    badge: 'NEW',
    colors: ['#c7b9a5', '#3c3a34', '#8a8a77'],
    colorNames: ['Oat', 'Midnight', 'Sage'],
    image: ownerCafe,
    alternate: ownerCafeAlt,
    description: 'A softly tailored two-piece set with a generous silhouette and an easy sense of occasion.'
  },
  {
    id: 'marsa-tote',
    name: 'Marsa everyday tote',
    type: 'Accessories',
    price: 9800,
    oldPrice: null,
    badge: '',
    colors: ['#765846', '#262523', '#c9b9a3'],
    colorNames: ['Chestnut', 'Black', 'Mushroom'],
    image: image('photo-1578237493287-8d4d2b03591a'),
    alternate: image('photo-1578237493287-8d4d2b03591a'),
    description: 'A sturdy everyday companion, designed to carry the little things that make a day yours.'
  },
  {
    id: 'sahar-skirt',
    name: 'Sahar pleated skirt',
    type: 'Skirts',
    price: 5700,
    oldPrice: 6500,
    badge: 'LAST CHANCE',
    colors: ['#32312d', '#d9caba', '#777667'],
    colorNames: ['Ink', 'Camel', 'Moss'],
    image: ownerDetail,
    alternate: ownerCafeAlt,
    description: 'Soft pleats and a graceful full-length line bring easy movement to an everyday essential.'
  },
  {
    id: 'kheyt-scarf',
    name: 'Kheyt brushed scarf',
    type: 'Accessories',
    price: 3200,
    oldPrice: null,
    badge: 'NEW',
    colors: ['#b8a38f', '#77796b', '#e1d7ca'],
    colorNames: ['Cinnamon', 'Sage', 'Oat'],
    image: ownerDenim,
    alternate: ownerDetail,
    description: 'A soft printed scarf that brings a little color and character to your everyday look.'
  }
];

export const money = amount => `EGP ${Number(amount).toLocaleString('en-EG', { maximumFractionDigits: 0 })}`;
