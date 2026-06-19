/* =========================================================================
   Sydney Trip — DEFAULT itinerary data (the template's seed values)
   This is only the *starting point*. The in-app Editor saves your edits to
   the browser (localStorage); Export here downloads a commit-ready data.js.
   ========================================================================= */

window.DEFAULT_TRIP = {
  title: "Sydney",
  subtitle: "雪梨之旅",
  tagline: "Buon Viaggio",
  year: 2026,
  currency: { code: "AUD", target: "HKD", rate: 5.1 }, // rough AUD -> HKD for the wallet helper

  days: [
    /* ---------------------------------------------------------------- DAY 1 */
    {
      date: "2026-06-20",
      dow: "Sat",
      label: "Arrival",
      city: "Sydney",
      hotel: "Shangri-La Sydney",
      weather: { text: "Mostly Sunny", min: 12, max: 19, icon: "sun" },
      items: [
        { part: "Afternoon", time: "09:10", title: "Flight CX139", note: "09:10 – 20:10", booked: true },
        { part: "Night", title: "Take T8 train to Circular Quay", map: "Circular Quay Station Sydney" },
        { part: "Night", title: "Check in — Shangri-La Sydney", map: "Shangri-La Sydney", tag: "hotel" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 2 */
    {
      date: "2026-06-21",
      dow: "Sun",
      label: "The Rocks",
      city: "Sydney",
      hotel: "Shangri-La Sydney",
      weather: { text: "Mostly Sunny", min: 13, max: 21, icon: "sun" },
      items: [
        { part: "Breakfast", title: "Black and White Espresso Bar", note: "or La Renaissance Patisserie & Cafe", map: "La Renaissance Patisserie The Rocks Sydney" },
        { part: "Morning", title: "The Rocks Market", note: "10am – 5pm", map: "The Rocks Markets Sydney" },
        { part: "Morning", title: "Museum of Contemporary Art (外觀)", map: "Museum of Contemporary Art Australia Sydney" },
        { part: "Morning", title: "F4 Ferry to opposite", map: "Circular Quay Ferry Wharf" },
        { part: "Lunch", time: "13:30", title: "Ester", booked: true, map: "Ester Restaurant Chippendale" },
        { part: "Afternoon", title: "雪梨中央車站 — Central Station", map: "Central Station Sydney" },
        { part: "Afternoon", title: "悉尼大學商學院 — USYD Business School", map: "University of Sydney Business School" },
        { part: "Dinner", time: "19:00", title: "Bar Totti's", note: "Booked — observe cancellation policy", booked: true, map: "Bar Totti's Sydney" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 3 */
    {
      date: "2026-06-22",
      dow: "Mon",
      label: "Opera House & Fish Market",
      city: "Sydney",
      hotel: "Shangri-La Sydney",
      weather: { text: "Mostly Sunny", min: 13, max: 19, icon: "sun" },
      items: [
        { part: "Breakfast", title: "Banksia Bakehouse", map: "Banksia Bakehouse Sydney" },
        { part: "Morning", time: "09:30", title: "Opera House Chinese tour", note: "AUD50 · Booked 9:30am", booked: true, map: "Sydney Opera House" },
        { part: "Lunch", title: "Sydney Fish Market — Nicholas Seafood", note: "7am – 10pm", map: "Nicholas Seafood Sydney Fish Market" },
        { part: "Afternoon", title: "Darling Exchange (飲茶)", note: "Darling Harbour Public Realm", map: "The Darling Exchange Sydney" },
        { part: "Afternoon", title: "Queen Victoria Building", map: "Queen Victoria Building Sydney" },
        { part: "Afternoon", title: "RivaReno Gelato Barangaroo", map: "RivaReno Gelato Barangaroo" },
        { part: "Dinner", time: "19:00", title: "Restaurant Hubert", note: "Booked — observe cancellation policy", booked: true, map: "Restaurant Hubert Sydney" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 4 */
    {
      date: "2026-06-23",
      dow: "Tue",
      label: "Hunter Valley",
      city: "Sydney",
      hotel: "Shangri-La Sydney",
      weather: { text: "Mostly Sunny", min: 11, max: 17, icon: "sun" },
      items: [
        { part: "All Day", time: "07:00", title: "Hunter Valley wine & cheese tasting tour", note: "7am – 6pm · Depart Darling Harbour Furama", booked: true, map: "Hunter Valley Wine Country" },
        { part: "Dinner", time: "20:00", title: "Neptune's Grotto", booked: true, map: "Neptune's Grotto Sydney" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 5 */
    {
      date: "2026-06-24",
      dow: "Wed",
      label: "Drive to Blue Mountains",
      city: "Katoomba",
      hotel: "Katoomba — Palais Royale Boutique Hotel",
      weather: { text: "Cloudy, Morning Shower", min: 11, max: 17, icon: "cloud-rain" },
      items: [
        { part: "Breakfast", title: "The Naked Duck", note: "Grosvenor Place (Grand Duk)", map: "The Naked Duck Grosvenor Place Sydney" },
        { part: "Morning", time: "09:00", title: "Pick up car — SIXT", note: "9am", tag: "car", map: "SIXT Car Rental Sydney" },
        { part: "Morning", title: "Featherdale 野生動物園 — Wildlife Park", map: "Featherdale Wildlife Park" },
        { part: "Lunch", title: "Asuka Japanese Kitchen", note: "big parking area", map: "Asuka Japanese Kitchen" },
        { part: "Afternoon", title: "Drive to Katoomba", map: "Katoomba NSW" },
        { part: "Afternoon", title: "Stargazing", map: "Blue Mountains Stargazing" },
        { part: "Dinner", title: "Pho Moi", map: "Pho Moi Katoomba" },
        { part: "Night", title: "Check in — Palais Royale Boutique Hotel", map: "Palais Royale Katoomba", tag: "hotel" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 6 */
    {
      date: "2026-06-25",
      dow: "Thu",
      label: "Scenic World",
      city: "Katoomba",
      hotel: "Katoomba — Palais Royale Boutique Hotel",
      weather: { text: "Mostly Sunny", min: 11, max: 18, icon: "sun" },
      items: [
        { part: "Breakfast", title: "The Elephant Bean", note: "07:00 – 14:30", map: "The Elephant Bean Katoomba" },
        { part: "Morning", title: "景觀世界纜車 — Scenic World", note: "Booked ticket", booked: true, map: "Scenic World Katoomba" },
        { part: "Morning", title: "推薦搭乘順序", note: "skyway → railway → walkway → cableway", tag: "tip" },
        { part: "Afternoon", title: "Echo Point Lookout (Three Sisters)", note: "Three Sisters walk", map: "Echo Point Lookout Katoomba" },
        { part: "Dinner", title: "Bowery", map: "Bowery Katoomba" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 7 */
    {
      date: "2026-06-26",
      dow: "Fri",
      label: "Oyster Farm",
      city: "Sydney Airport",
      hotel: "Pullman Sydney Airport",
      weather: { text: "Mostly Sunny", min: 11, max: 17, icon: "sun" },
      items: [
        { part: "Breakfast", title: "Black Cockatoo Bakery", note: "07:30 – 14:00", map: "Black Cockatoo Bakery" },
        { part: "Morning", time: "11:30", title: "Sydney Oyster Farm Tours", note: "AUD219 · Booked · 11:30 – 14:00", booked: true, map: "Sydney Oyster Farm Tours Mooney Mooney" },
        { part: "Afternoon", time: "15:00", title: "Woy Woy waterfront", map: "Woy Woy Waterfront NSW" },
        { part: "Afternoon", time: "18:00", title: "Return car — SIXT", note: "6pm", tag: "car", map: "SIXT Car Rental Sydney Airport" },
        { part: "Night", title: "Check in — Pullman Sydney Airport", map: "Pullman Sydney Airport", tag: "hotel" }
      ]
    },

    /* ---------------------------------------------------------------- DAY 8 */
    {
      date: "2026-06-27",
      dow: "Sat",
      label: "Departure",
      city: "Sydney Airport",
      hotel: null,
      weather: { text: "Mostly Sunny", min: 10, max: 18, icon: "sun" },
      items: [
        { part: "Afternoon", time: "10:10", title: "Flight QF127", note: "10:10 – 17:55", booked: true, map: "Sydney Airport" }
      ]
    }
  ],

  /* Backup / wishlist spots not yet slotted into a day */
  saved: [
    { title: "Bondi to Coogee Coastal Walk", note: "6km clifftop walk", map: "Bondi to Coogee Coastal Walk" },
    { title: "Royal Botanic Garden", note: "Mrs Macquarie's Chair viewpoint", map: "Royal Botanic Garden Sydney" },
    { title: "Sydney Tower Eye", note: "360° city views", map: "Sydney Tower Eye" },
    { title: "Paddington Markets", note: "Saturdays only", map: "Paddington Markets Sydney" }
  ]
};
