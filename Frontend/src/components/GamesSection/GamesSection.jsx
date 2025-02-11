import "./GamesSection.css"
import GameCard from "../GameCard/GameCard"

function GamesSection({ title, trending }) {
  const games = trending
    ? [
        {
          title: "Marvel Rivals",
          image: "https://www.giantbomb.com/a/uploads/original/0/1992/3686550-5383796058-libra.jpg",
          views: 410,
          isNew: true,
          rating: 4.5,
        },
        {
          title: "Fortnite",
          image: "https://www.giantbomb.com/a/uploads/original/8/87790/2952214-box_fn.png",
          views: 16594,
          rating: 4.2,
        },
        {
          title: "Clash of Clans",
          image:
            "https://www.giantbomb.com/a/uploads/scale_large/15/150889/2347208-fc003520bf87740009010db7c453da78.png",
          views: 9585,
          rating: 4.0,
        },
        {
          title: "Valorant",
          image: "https://www.giantbomb.com/a/uploads/original/0/1992/3587046-5466182583-9edb6.jpg",
          views: 6067,
          rating: 4.3,
        },
        {
          title: "Grand Theft Auto",
          image: "https://www.giantbomb.com/a/uploads/original/20/201266/3532840-6042895878-co2lb.png",
          views: 7578,
          rating: 4.8,
        },
      ]
    : [
      {
        "title": "Apex Legends",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/3079288-box_al.png",
        "views": 449,
        "rating": 4.4
      },
      {
        "title": "Black Desert",
        "image": "https://www.giantbomb.com/a/uploads/original/20/201266/3500248-8952941033-ECnm4C.jpeg",
        "views": 16,
        "rating": 3.8
      },
      {
        "title": "Boom Beach",
        "image": "https://www.giantbomb.com/a/uploads/original/3/38364/2614253-bblogo.jpg",
        "views": 2,
        "rating": 3.5
      },
      {
        "title": "League of Legends",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/3175371-box_lol.png",
        "views": 7428,
        "rating": 4.1
      },
      {
        "title": "Brawl Stars",
        "image": "https://www.giantbomb.com/a/uploads/original/35/353625/2946460-pglt0giz_400x400.jpg",
        "views": 4662,
        "rating": 3.9
      },
      {
        "title": "Minecraft",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/3020660-box_mc.png",
        "views": 10500,
        "rating": 4.8
      },
      {
        "title": "PUBG Mobile",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/3309402-box_pubgbg.png",
        "views": 8900,
        "rating": 4.2
      },
      {
        "title": "Roblox",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/2956731-box_roblox.png",
        "views": 12000,
        "rating": 4.3
      },
      {
        "title": "XDefiant",
        "image": "https://www.giantbomb.com/a/uploads/original/33/338034/3469217-0519148368-apps.54528.13644549899770103.7017f1fe-a0a9-4944-9d70-e6e54a8486d0.04235bb7-f575-48e3-9049-abfb007daf52.jpg  ",
        "views": 3200,
        "rating": 4.0
      },
      {
        "title": "NBA 2K",
        "image": "https://www.giantbomb.com/a/uploads/original/8/87790/2246602-box_nbastr3.png",
        "views": 5200,
        "rating": 4.1
      }
    ]
    

  return (
    <section className="games-section">
      <div className="section-header">
        <h2>{title}</h2>
        {trending && (
          <svg className="trending-icon" viewBox="0 0 24 24">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
      </div>
      <div className="games-grid">
        {games.map((game) => (
          <GameCard key={game.title} {...game} />
        ))}
      </div>
    </section>
  )
}

export default GamesSection

