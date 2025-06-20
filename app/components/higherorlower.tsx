"use client";
import React, { useEffect, useState, useRef } from "react";

type PriceItem = {
  item: string;
  price: number;
  emoji?: string;
};

// Helper: get a random integer in [0, n)
function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

// Helper: get a random element from an array
function randElem<T>(arr: T[]): T {
  return arr[randInt(arr.length)];
}

// Get a random pair, but sometimes (15% chance) make them very close in price for extra challenge
function getRandomPair(prices: PriceItem[]): [PriceItem, PriceItem] {
  if (prices.length < 2) throw new Error("Need at least 2 items");
  // 15% chance: pick two items with price difference < 10%
  if (Math.random() < 0.15) {
    const sorted = [...prices].sort((a, b) => a.price - b.price);
    // Find all pairs with <10% price difference
    const closePairs: [PriceItem, PriceItem][] = [];
    for (let i = 0; i < sorted.length - 1; ++i) {
      const a = sorted[i], b = sorted[i + 1];
      const percent = Math.abs(a.price - b.price) / Math.max(a.price, b.price);
      if (percent < 0.10) closePairs.push([a, b]);
    }
    if (closePairs.length > 0) return randElem(closePairs);
  }
  // Otherwise, pick two random distinct
  const idx1 = randInt(prices.length);
  let idx2 = idx1;
  while (idx2 === idx1) {
    idx2 = randInt(prices.length);
  }
  return [prices[idx1], prices[idx2]];
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Fun facts for some items (add more as desired)
const funFacts: Record<string, string> = {
  "Official NBA Basketball": "🏀 The official NBA basketball is made of genuine leather and is used in all NBA games. Did you know the NBA uses over 72 balls per season?",
  "Solar Insect Zapper": "🔆 Solar insect zappers use UV light to attract bugs and are powered by the sun! Some can zap over 1,000 bugs per night.",
  "Golf Club (Driver)": "⛳ Modern drivers can have club heads as large as 460cc for maximum forgiveness. Tiger Woods' longest drive in competition is 498 yards!",
  "Camping Chair": "🪑 The first folding camping chair was invented in the late 19th century. Some modern chairs can hold over 800 lbs!",
  "Running Shoes": "👟 The first cushioned running shoe was introduced by Nike in 1972. The world record for the fastest marathon is 2:00:35!",
  "Yoga Mat (Premium)": "🧘 Yoga mats were originally made from carpet underlay before sticky mats were invented. The longest yoga marathon lasted 56 hours!",
  "Fishing Rod": "🎣 The earliest fishing rods date back to ancient Egypt, over 4,000 years ago. The largest fish ever caught on rod and reel weighed 2,664 lbs!",
  "Dumbbell Set (Adjustable)": "🏋️ Adjustable dumbbells save space and allow for quick weight changes during workouts. The heaviest dumbbell ever lifted is 640 lbs!",
  "Binocular Tripod Adapter": "🔭 Tripod adapters help stabilize binoculars for long viewing sessions. The world’s largest binoculars weigh over 1,000 lbs!",
  "Wildflower Honey Sampler": "🍯 Honey never spoils and has been found in ancient Egyptian tombs still edible. Bees must visit 2 million flowers to make 1 pound of honey.",
  "Treadmill (Folding)": "🏃 The first treadmill was invented in 1818 as a punishment device for prisoners. The longest treadmill run is over 153 miles in 24 hours!",
  "Soccer Ball (FIFA Quality)": "⚽ A FIFA Quality soccer ball must pass rigorous tests for weight, bounce, and shape. The fastest shot ever recorded is 131 mph!",
  "Baseball Glove": "🥎 Baseball gloves were not commonly used until the 1870s. The largest glove ever made is over 25 feet long!",
  "Bird Call Whistle": "🐦 Bird call whistles can mimic the sounds of dozens of bird species. Some can even attract rare birds from miles away.",
  "Nature Meditation Audio Pack": "🎧 Nature sounds can help reduce stress and improve focus. Listening to birdsong can boost creativity by 20%.",
  "Wilderness Survival Guidebook": "📚 Survival guidebooks often include tips for edible plants and emergency shelters. The SAS Survival Handbook has sold over 1 million copies.",
  "Olympic Torch Replica": "🔥 The Olympic torch relay tradition began in the 1936 Berlin Games. The torch has traveled to space and underwater!",
  "Sports Nutrition Bar Pack": "🍫 The first energy bars were developed for astronauts in the 1960s. The average American eats 12 energy bars per year.",
  "Climbing Shoes": "🧗 Climbing shoes are designed with sticky rubber soles for better grip on rocks. The highest free solo climb is over 3,000 feet!",
  "Track Spike Shoes": "👟 Track spikes help runners grip the track and run faster. Usain Bolt’s spikes are custom-molded for his feet.",
  "Inline Skating Knee Pads": "🛼 Protective gear is essential for safe inline skating, especially for beginners. The world record for fastest inline skating is 77 mph!",
  "Nature Discovery Box (Monthly)": "📦 Subscription boxes bring nature exploration to your doorstep every month. Some include real fossils and meteorites!",
  "Eco-Friendly Sleeping Bag": "🌱 Eco-friendly sleeping bags use recycled materials for insulation and fabric. The warmest sleeping bag can keep you safe at -60°F.",
  "Paralympic Event Ticket": "🎟️ The Paralympic Games showcase the incredible abilities of athletes with disabilities. The first Games were held in 1960.",
  "Virtual Race Entry": "🌍 Virtual races let you compete from anywhere in the world, at your own pace. The largest virtual race had over 1 million participants.",
  "Cheerleader Pom Poms": "📣 Pom poms were first used in cheerleading in the 1930s. The world’s largest pom pom weighed 100 lbs!",
  "Sports Gym Bag": "👜 A good gym bag keeps your gear organized and fresh. The average gym bag contains 7 different items.",
  "Nature Trail Audio Tour": "🎤 Audio tours enhance your hiking experience with stories and facts about the trail. Some tours are narrated by famous naturalists.",
  "Plant Identification App (Premium)": "🌿 Plant ID apps use AI to recognize thousands of plant species from photos. The largest plant database has over 1.2 million entries.",
  "CrossFit Jump Box": "📦 Jump boxes are used for plyometric training to build explosive power. The world record box jump is 63.5 inches!",
  "Martial Arts Gi": "🥋 The gi is a traditional uniform used in many martial arts, including judo and karate. The heaviest gi ever made weighed 30 lbs.",
  "Bike Repair Tool Kit": "🚲 A compact tool kit can save your ride in case of a breakdown. The longest bike ride ever was over 120,000 miles.",
  "Sports Trivia Game": "🎲 Test your knowledge of sports history, records, and legends! The largest trivia contest had over 13,000 teams.",
};

const bonusFacts = [
  "🔥 Bonus: If you get 5 in a row, you'll unlock a secret fun fact!",
  "💡 Challenge: Try to guess the price difference before revealing!",
  "🎯 Streak: Every 10 correct answers, you get a rare trivia!",
  "🧠 Brain Teaser: Can you guess which item is more popular?",
  "🌟 Pro Tip: Sometimes the cheaper item is actually more useful!",
  "🎲 Randomizer: Occasionally, both items are nearly the same price. Watch out!",
  "🦄 Ultra-Rare: If you get 20 in a row, you unlock a legendary fact!",
  "🕵️‍♂️ Detective: Can you spot a pattern in the item prices?",
  "🎵 Sound On: Play with sound for a surprise after a streak!",
];

const wildEvents = [
  "🌪️ Wild Card! Both items are from the same category. Can you spot which?",
  "🦸‍♂️ Super Round! If you guess the price difference within $10, double points!",
  "🎲 Randomizer: The prices have been swapped! Can you still guess right?",
  "🧩 Puzzle: One of these items is a best-seller. Which one?",
  "🕰️ Time Attack! Make your choice in under 3 seconds for a bonus.",
];

function getFunFact(item: string): string | null {
  return funFacts[item] || null;
}

function getPriceDiffFact(left: PriceItem, right: PriceItem): string {
  const diff = Math.abs(left.price - right.price);
  const percent = ((diff / Math.max(left.price, right.price)) * 100).toFixed(1);
  if (diff === 0) {
    return "🤯 These two items cost exactly the same! What are the odds?";
  }
  if (parseFloat(percent) < 5) {
    return `😮 These items are almost the same price (only ${percent}% apart)!`;
  }
  if (parseFloat(percent) > 100) {
    return `💸 One of these is more than twice as expensive as the other!`;
  }
  if (parseFloat(percent) > 50) {
    return `🚀 There's a huge price gap: one is over 50% more expensive!`;
  }
  return `The price difference is about ${percent}%.`;
}

function getBonusFact(score: number): string | null {
  if (score > 0 && score % 5 === 0) {
    // 1 in 3 chance to show a wild event instead
    if (Math.random() < 0.33) return randElem(wildEvents);
    return randElem(bonusFacts);
  }
  return null;
}

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const emojis = ["🎉", "✨", "🏆", "🎊", "🥳", "🔥", "💰", "🦄", "🌟", "💎"];
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-7xl select-none drop-shadow-lg">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} style={{
            position: "relative",
            left: `${Math.random() * 80 - 40}px`,
            top: `${Math.random() * 60 - 30}px`,
            animation: `confetti-fall 1.2s ${0.08 * i}s cubic-bezier(.4,0,.2,1)`,
            display: "inline-block",
            transform: `rotate(${randInt(360)}deg) scale(${1 + Math.random() * 0.5})`,
            color: ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#f87171", "#a78bfa"][randInt(6)],
          }}>
            {randElem(emojis)}
          </span>
        ))}
        <style jsx global>{`
          @keyframes confetti-fall {
            0% { opacity: 0; transform: translateY(-80px) scale(1.2) rotate(-20deg);}
            60% { opacity: 1; }
            100% { opacity: 0; transform: translateY(80px) scale(0.8) rotate(20deg);}
          }
        `}</style>
      </div>
    </div>
  );
}

export default function HigherOrLower() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [pair, setPair] = useState<[PriceItem, PriceItem] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<"left" | "right" | null>(null);
  const [reveal, setReveal] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Fun fact state
  const [showFact, setShowFact] = useState<string | null>(null);
  const [factItem, setFactItem] = useState<string | null>(null);

  // New: price diff fact
  const [showDiffFact, setShowDiffFact] = useState<string | null>(null);

  // New: bonus fact
  const [showBonusFact, setShowBonusFact] = useState<string | null>(null);

  // New: confetti for streaks
  const [showConfetti, setShowConfetti] = useState(false);

  // New: "guess the price difference" prompt
  const [guessDiff, setGuessDiff] = useState<string>("");
  const [showGuessResult, setShowGuessResult] = useState<null | string>(null);

  // New: wild event state
  const [wildEvent, setWildEvent] = useState<string | null>(null);

  // For focus ring accessibility
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);

  // Load prices.json on mount
  useEffect(() => {
    fetch("/prices.json")
      .then((res) => res.json())
      .then((data) => {
        // Add random emoji to each item for extra fun
        const emojis = ["🏀", "🌞", "⛳", "🪑", "👟", "🧘", "🎣", "🏋️", "🔭", "🍯", "🏃", "⚽", "🥎", "🐦", "🎧", "📚", "🔥", "🍫", "🧗", "👟", "🛼", "📦", "🌱", "🎟️", "🌍", "📣", "👜", "🎤", "🌿", "📦", "🥋", "🚲", "🎲", "🦄", "💎", "💰"];
        setPrices(
          data.map((item: PriceItem, i: number) => ({
            ...item,
            emoji: emojis[i % emojis.length],
          }))
        );
        setPair(getRandomPair(data));
      });
  }, []);

  // Update high score if score exceeds it when game over
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  // Show fun fact after each reveal, if available
  useEffect(() => {
    if (reveal && pair && selected) {
      // Show fun fact for the revealed item (the one the user picked)
      const pickedItem = selected === "left" ? pair[0] : pair[1];
      const fact = getFunFact(pickedItem.item);
      if (fact) {
        setTimeout(() => {
          setShowFact(fact);
          setFactItem(pickedItem.item);
        }, 400); // Show after price reveal
      } else {
        setShowFact(null);
        setFactItem(null);
      }
      // Show price diff fact
      setTimeout(() => {
        setShowDiffFact(getPriceDiffFact(pair[0], pair[1]));
      }, 600);
    } else {
      setShowFact(null);
      setFactItem(null);
      setShowDiffFact(null);
    }
  }, [reveal, pair, selected]);

  // Show bonus fact or wild event on streaks
  useEffect(() => {
    if (score > 0 && score % 5 === 0 && !gameOver) {
      const bonus = getBonusFact(score);
      setShowBonusFact(bonus);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
      if (wildEvents.includes(bonus || "")) {
        setWildEvent(bonus);
        setTimeout(() => setWildEvent(null), 3500);
      } else {
        setWildEvent(null);
      }
    } else {
      setShowBonusFact(null);
      setWildEvent(null);
    }
  }, [score, gameOver]);

  function handleChoice(choice: "left" | "right") {
    if (!pair || reveal) return;
    setSelected(choice);
    setReveal(true);

    const left = pair[0];
    const right = pair[1];
    const isLeftHigher = left.price > right.price;
    const isRightHigher = right.price > left.price;
    const isEqual = left.price === right.price;

    let correctChoice = false;
    if (isEqual) {
      correctChoice = true;
    } else {
      if (choice === "left" && isLeftHigher) correctChoice = true;
      if (choice === "right" && isRightHigher) correctChoice = true;
    }

    setTimeout(() => {
      if (correctChoice) {
        setCorrect(true);
        setTimeout(() => {
          setCorrect(false);
          setScore((s) => s + 1);
          // Next round: keep the "winner", pick a new random challenger
          let newPair: [PriceItem, PriceItem];
          if (isEqual) {
            // If equal, randomly keep left or right as "winner"
            const keepLeft = Math.random() < 0.5;
            const winner = keepLeft ? left : right;
            let challenger: PriceItem;
            do {
              challenger = prices[randInt(prices.length)];
            } while (challenger.item === winner.item);
            newPair = [winner, challenger];
          } else if (choice === "left") {
            let challenger: PriceItem;
            do {
              challenger = prices[randInt(prices.length)];
            } while (challenger.item === left.item);
            newPair = [left, challenger];
          } else {
            let challenger: PriceItem;
            do {
              challenger = prices[randInt(prices.length)];
            } while (challenger.item === right.item);
            newPair = [right, challenger];
          }
          setPair(newPair);
          setAnimKey((k) => k + 1);
          setReveal(false);
          setSelected(null);
          setShowFact(null);
          setFactItem(null);
          setShowDiffFact(null);
          setGuessDiff("");
          setShowGuessResult(null);
        }, 1800);
      } else {
        setTimeout(() => {
          setGameOver(true);
        }, 1400);
      }
    }, 800);
  }

  function handleRestart() {
    setGameOver(false);
    setScore(0);
    setReveal(false);
    setSelected(null);
    setAnimKey((k) => k + 1);
    setShowFact(null);
    setFactItem(null);
    setShowDiffFact(null);
    setShowBonusFact(null);
    setShowConfetti(false);
    setGuessDiff("");
    setShowGuessResult(null);
    setWildEvent(null);
    if (prices.length >= 2) {
      setPair(getRandomPair(prices));
    }
  }

  function handleGuessDiffSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pair) return;
    const actualDiff = Math.abs(pair[0].price - pair[1].price);
    const guess = parseInt(guessDiff.replace(/[^0-9]/g, ""), 10);
    if (isNaN(guess)) {
      setShowGuessResult("Please enter a number!");
      return;
    }
    const delta = Math.abs(guess - actualDiff);
    if (delta < 5) {
      setShowGuessResult("🎯 Amazing! You were almost spot on!");
    } else if (delta < 20) {
      setShowGuessResult("👍 Pretty close!");
    } else {
      setShowGuessResult("😅 Not quite, but keep trying!");
    }
    setTimeout(() => setShowGuessResult(null), 1800);
  }

  if (!pair) {
    return (
      <div
        className="flex w-full h-screen items-center justify-center"
        style={{
          background: "radial-gradient(circle at 60% 40%, #3a3a4d 0%, #232526 100%)",
        }}
      >
        <span className="text-2xl font-semibold animate-pulse text-neutral-100">Loading the price arena...</span>
      </div>
    );
  }

  if (gameOver) {
    let randomFact: string | null = null;
    let randomItem: string | null = null;
    const factKeys = Object.keys(funFacts);
    if (factKeys.length > 0) {
      const idx = randInt(factKeys.length);
      randomItem = factKeys[idx];
      randomFact = funFacts[randomItem];
    }
    const challenge = randElem([
      "Try to beat your high score next round!",
      "Can you get a perfect streak?",
      "Guess the price difference before revealing for extra fun!",
      "Share your score with a friend and challenge them!",
      "Try to get 3 correct in a row for a surprise!",
      "Try to get a 20-streak for a legendary fact!",
    ]);
    return (
      <div
        className="flex flex-col w-full h-screen items-center justify-center"
        style={{
          background: "radial-gradient(circle at 60% 40%, #3a3a4d 0%, #232526 100%)",
        }}
      >
        <div className="text-5xl font-extrabold mb-6 text-pink-400 drop-shadow-lg animate-bounce">Game Over</div>
        <div className="mb-2 text-2xl font-medium text-neutral-200">
          Your score: <span className="font-bold text-pink-300">{score}</span>
        </div>
        <div className="mb-6 text-xl font-medium text-neutral-400">
          Highest this session: <span className="font-bold text-pink-200">{Math.max(score, highScore)}</span>
        </div>
        {randomFact && (
          <div className="mb-4 px-6 py-4 bg-neutral-800 rounded-lg border border-pink-700 shadow text-pink-200 max-w-xl text-center animate-fade-in">
            <span className="font-bold text-pink-400">Did you know?</span>
            <br />
            <span className="text-neutral-100">{randomFact}</span>
            <br />
            <span className="text-xs text-neutral-400">({randomItem})</span>
          </div>
        )}
        <div className="mb-8 px-6 py-3 bg-neutral-900 rounded-lg border border-pink-800 shadow text-pink-300 max-w-lg text-center animate-fade-in">
          <span className="font-bold text-pink-400">Next Challenge:</span>
          <br />
          <span className="text-neutral-100">{challenge}</span>
        </div>
        <button
          className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-lg transition-all duration-200 text-lg font-semibold"
          onClick={handleRestart}
        >
          Play Again
        </button>
      </div>
    );
  }

  const isEqual = pair[0].price === pair[1].price;
  const streakPercent = Math.min(score / 10, 1) * 100;

  return (
    <div
      className="flex flex-col w-full h-screen items-center justify-center relative"
      style={{
        background: "radial-gradient(circle at 60% 40%, #3a3a4d 0%, #232526 100%)",
      }}
    >
      <Confetti show={showConfetti} />
      {/* Score */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full max-w-lg">
        <div className="bg-neutral-800 px-8 py-3 rounded-lg shadow text-2xl font-bold text-pink-300 border border-neutral-700 w-full text-center">
          Score: <span className="transition-all duration-300">{score}</span>
        </div>
        {/* Progress bar for streak */}
        <div className="w-full h-3 mt-2 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all duration-500"
            style={{ width: `${streakPercent}%` }}
          ></div>
        </div>
        <div className="text-xs text-neutral-400 mt-1">
          {score < 10
            ? `Keep going! ${10 - score} to a 10-streak!`
            : `🔥 You're on a hot streak!`}
        </div>
        {showBonusFact && (
          <div className="mt-2 px-4 py-2 bg-pink-900/80 rounded shadow text-pink-200 text-center animate-fade-in border border-pink-700">
            {showBonusFact}
          </div>
        )}
        {wildEvent && (
          <div className="mt-2 px-4 py-2 bg-yellow-900/80 rounded shadow text-yellow-200 text-center animate-fade-in border border-yellow-700 font-bold text-lg">
            {wildEvent}
          </div>
        )}
      </div>
      {/* Cards */}
      <div className="flex flex-row items-center justify-center gap-12 w-full max-w-5xl">
        {/* Left Card */}
        <button
          ref={leftBtnRef}
          tabIndex={0}
          key={animKey + "-left"}
          className={`
            flex flex-col items-center justify-between w-72 h-96 p-8
            rounded-xl border-4
            ${
              selected === "left" && reveal
                ? isEqual
                  ? "border-green-500 bg-neutral-800 scale-105"
                  : pair[0].price > pair[1].price
                    ? "border-green-500 bg-neutral-800 scale-105"
                    : "border-red-500 bg-neutral-800 opacity-70 scale-95"
                : "border-neutral-700 bg-neutral-800 hover:border-pink-400 hover:scale-105"
            }
            transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400
            ${reveal ? "pointer-events-none" : ""}
          `}
          onClick={() => handleChoice("left")}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleChoice("left"); }}
          aria-label={`Choose ${pair[0].item}`}
        >
          <span className="text-3xl mb-1">{pair[0].emoji || "🛒"}</span>
          <span className="text-xl font-bold text-neutral-100 text-center mb-2">{pair[0].item}</span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className={`
              text-5xl font-mono select-none
              ${reveal
                ? isEqual
                  ? "text-green-400"
                  : pair[0].price > pair[1].price
                    ? "text-green-400"
                    : "text-red-400"
                : "text-neutral-500"}
              transition-all duration-200
            `}>
              {reveal ? formatNumber(pair[0].price) : "?"}
            </span>
          </div>
          <span className="mt-4 text-base font-semibold uppercase tracking-wider text-neutral-400">
            {selected === "left" && reveal
              ? isEqual
                ? "Correct!"
                : (pair[0].price > pair[1].price ? "Correct!" : "Wrong!")
              : "Pick Me"}
          </span>
        </button>
        {/* VS Divider */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold text-pink-400 mb-2 animate-pulse">VS</div>
          {/* New: Guess the price difference */}
          {!reveal && (
            <form onSubmit={handleGuessDiffSubmit} className="flex flex-col items-center mt-2">
              <label className="text-xs text-neutral-400 mb-1">Guess the price difference ($):</label>
              <input
                type="text"
                value={guessDiff}
                onChange={e => setGuessDiff(e.target.value)}
                className="w-24 px-2 py-1 rounded bg-neutral-900 border border-pink-700 text-pink-200 text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="e.g. 20"
                disabled={reveal}
              />
              <button
                type="submit"
                className="mt-1 px-2 py-1 bg-pink-700 hover:bg-pink-800 text-white rounded text-xs font-semibold transition-all duration-150"
                disabled={reveal}
              >
                Guess
              </button>
              {showGuessResult && (
                <div className="mt-1 text-xs text-pink-300 animate-fade-in">{showGuessResult}</div>
              )}
            </form>
          )}
        </div>
        {/* Right Card */}
        <button
          ref={rightBtnRef}
          tabIndex={0}
          key={animKey + "-right"}
          className={`
            flex flex-col items-center justify-between w-72 h-96 p-8
            rounded-xl border-4
            ${
              selected === "right" && reveal
                ? isEqual
                  ? "border-green-500 bg-neutral-800 scale-105"
                  : pair[1].price > pair[0].price
                    ? "border-green-500 bg-neutral-800 scale-105"
                    : "border-red-500 bg-neutral-800 opacity-70 scale-95"
                : "border-neutral-700 bg-neutral-800 hover:border-pink-400 hover:scale-105"
            }
            transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400
            ${reveal ? "pointer-events-none" : ""}
          `}
          onClick={() => handleChoice("right")}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleChoice("right"); }}
          aria-label={`Choose ${pair[1].item}`}
        >
          <span className="text-3xl mb-1">{pair[1].emoji || "🛒"}</span>
          <span className="text-xl font-bold text-neutral-100 text-center mb-2">{pair[1].item}</span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className={`
              text-5xl font-mono select-none
              ${reveal
                ? isEqual
                  ? "text-green-400"
                  : pair[1].price > pair[0].price
                    ? "text-green-400"
                    : "text-red-400"
                : "text-neutral-500"}
              transition-all duration-200
            `}>
              {reveal ? formatNumber(pair[1].price) : "?"}
            </span>
          </div>
          <span className="mt-4 text-base font-semibold uppercase tracking-wider text-neutral-400">
            {selected === "right" && reveal
              ? isEqual
                ? "Correct!"
                : (pair[1].price > pair[0].price ? "Correct!" : "Wrong!")
              : "Pick Me"}
          </span>
        </button>
      </div>
      {/* Fun Fact Display */}
      {(showFact || showDiffFact) && (
        <div className="mt-8 px-6 py-4 bg-neutral-800 rounded-lg border border-pink-700 shadow text-pink-200 max-w-xl text-center animate-fade-in">
          {showFact && (
            <>
              <span className="font-bold text-pink-400">Did you know?</span>
              <br />
              <span className="text-neutral-100">{showFact}</span>
              <br />
              <span className="text-xs text-neutral-400">({factItem})</span>
              <br />
            </>
          )}
          {showDiffFact && (
            <>
              <span className="font-bold text-pink-400">Price Trivia:</span>
              <br />
              <span className="text-neutral-100">{showDiffFact}</span>
            </>
          )}
        </div>
      )}
      {/* Minimal animation for fade-in */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
