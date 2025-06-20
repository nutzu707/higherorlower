"use client";
import React, { useEffect, useState, useRef } from "react";

type PriceItem = {
  item: string;
  price: number;
};

function getRandomPair(prices: PriceItem[]): [PriceItem, PriceItem] {
  if (prices.length < 2) throw new Error("Need at least 2 items");
  const idx1 = Math.floor(Math.random() * prices.length);
  let idx2 = idx1;
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * prices.length);
  }
  return [prices[idx1], prices[idx2]];
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Fun facts for some items (add more as desired)
const funFacts: Record<string, string> = {
  "Official NBA Basketball": "The official NBA basketball is made of genuine leather and is used in all NBA games.",
  "Solar Insect Zapper": "Solar insect zappers use UV light to attract bugs and are powered by the sun!",
  "Golf Club (Driver)": "Modern drivers can have club heads as large as 460cc for maximum forgiveness.",
  "Camping Chair": "The first folding camping chair was invented in the late 19th century.",
  "Running Shoes": "The first cushioned running shoe was introduced by Nike in 1972.",
  "Yoga Mat (Premium)": "Yoga mats were originally made from carpet underlay before sticky mats were invented.",
  "Fishing Rod": "The earliest fishing rods date back to ancient Egypt, over 4,000 years ago.",
  "Dumbbell Set (Adjustable)": "Adjustable dumbbells save space and allow for quick weight changes during workouts.",
  "Binocular Tripod Adapter": "Tripod adapters help stabilize binoculars for long viewing sessions.",
  "Wildflower Honey Sampler": "Honey never spoils and has been found in ancient Egyptian tombs still edible.",
  "Treadmill (Folding)": "The first treadmill was invented in 1818 as a punishment device for prisoners.",
  "Soccer Ball (FIFA Quality)": "A FIFA Quality soccer ball must pass rigorous tests for weight, bounce, and shape.",
  "Baseball Glove": "Baseball gloves were not commonly used until the 1870s.",
  "Bird Call Whistle": "Bird call whistles can mimic the sounds of dozens of bird species.",
  "Nature Meditation Audio Pack": "Nature sounds can help reduce stress and improve focus.",
  "Wilderness Survival Guidebook": "Survival guidebooks often include tips for edible plants and emergency shelters.",
  "Olympic Torch Replica": "The Olympic torch relay tradition began in the 1936 Berlin Games.",
  "Sports Nutrition Bar Pack": "The first energy bars were developed for astronauts in the 1960s.",
  "Climbing Shoes": "Climbing shoes are designed with sticky rubber soles for better grip on rocks.",
  "Track Spike Shoes": "Track spikes help runners grip the track and run faster.",
  "Inline Skating Knee Pads": "Protective gear is essential for safe inline skating, especially for beginners.",
  "Nature Discovery Box (Monthly)": "Subscription boxes bring nature exploration to your doorstep every month.",
  "Eco-Friendly Sleeping Bag": "Eco-friendly sleeping bags use recycled materials for insulation and fabric.",
  "Paralympic Event Ticket": "The Paralympic Games showcase the incredible abilities of athletes with disabilities.",
  "Virtual Race Entry": "Virtual races let you compete from anywhere in the world, at your own pace.",
  "Cheerleader Pom Poms": "Pom poms were first used in cheerleading in the 1930s.",
  "Sports Gym Bag": "A good gym bag keeps your gear organized and fresh.",
  "Nature Trail Audio Tour": "Audio tours enhance your hiking experience with stories and facts about the trail.",
  "Plant Identification App (Premium)": "Plant ID apps use AI to recognize thousands of plant species from photos.",
  "CrossFit Jump Box": "Jump boxes are used for plyometric training to build explosive power.",
  "Martial Arts Gi": "The gi is a traditional uniform used in many martial arts, including judo and karate.",
  "Bike Repair Tool Kit": "A compact tool kit can save your ride in case of a breakdown.",
  "Sports Trivia Game": "Test your knowledge of sports history, records, and legends!",
};

function getFunFact(item: string): string | null {
  return funFacts[item] || null;
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

  // For focus ring accessibility
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);

  // Load prices.json on mount
  useEffect(() => {
    fetch("/prices.json")
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);
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
    } else {
      setShowFact(null);
      setFactItem(null);
    }
  }, [reveal, pair, selected]);

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
              challenger = prices[Math.floor(Math.random() * prices.length)];
            } while (challenger.item === winner.item);
            newPair = [winner, challenger];
          } else if (choice === "left") {
            let challenger: PriceItem;
            do {
              challenger = prices[Math.floor(Math.random() * prices.length)];
            } while (challenger.item === left.item);
            newPair = [left, challenger];
          } else {
            let challenger: PriceItem;
            do {
              challenger = prices[Math.floor(Math.random() * prices.length)];
            } while (challenger.item === right.item);
            newPair = [right, challenger];
          }
          setPair(newPair);
          setAnimKey((k) => k + 1);
          setReveal(false);
          setSelected(null);
          setShowFact(null);
          setFactItem(null);
        }, 1200); // Give more time for fun fact
      } else {
        setTimeout(() => {
          setGameOver(true);
        }, 900); // Give more time for fun fact
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
    if (prices.length >= 2) {
      setPair(getRandomPair(prices));
    }
  }

  if (!pair) {
    return (
      <div
        className="flex w-full h-screen items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
        }}
      >
        <span className="text-2xl font-semibold animate-pulse text-neutral-100">Loading...</span>
      </div>
    );
  }

  if (gameOver) {
    // Show a random fun fact on game over for extra engagement
    let randomFact: string | null = null;
    let randomItem: string | null = null;
    const factKeys = Object.keys(funFacts);
    if (factKeys.length > 0) {
      const idx = Math.floor(Math.random() * factKeys.length);
      randomItem = factKeys[idx];
      randomFact = funFacts[randomItem];
    }
    return (
      <div
        className="flex flex-col w-full h-screen items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
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
          <div className="mb-8 px-6 py-4 bg-neutral-800 rounded-lg border border-pink-700 shadow text-pink-200 max-w-xl text-center animate-fade-in">
            <span className="font-bold text-pink-400">Did you know?</span>
            <br />
            <span className="text-neutral-100">{randomFact}</span>
            <br />
            <span className="text-xs text-neutral-400">({randomItem})</span>
          </div>
        )}
        <button
          className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-lg transition-all duration-200 text-lg font-semibold"
          onClick={handleRestart}
        >
          Play Again
        </button>
      </div>
    );
  }

  // New design: dark mode, minimal, bold, no glassmorphism, no gradients, clear contrast, big buttons
  const isEqual = pair[0].price === pair[1].price;

  // Progress bar for streak
  const streakPercent = Math.min(score / 10, 1) * 100; // 10 is arbitrary for full bar

  return (
    <div
      className="flex flex-col w-full h-screen items-center justify-center relative"
      style={{
        background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
      }}
    >
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
          <div className="text-4xl font-extrabold text-pink-400 mb-2">VS</div>
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
      {showFact && (
        <div className="mt-8 px-6 py-4 bg-neutral-800 rounded-lg border border-pink-700 shadow text-pink-200 max-w-xl text-center animate-fade-in">
          <span className="font-bold text-pink-400">Did you know?</span>
          <br />
          <span className="text-neutral-100">{showFact}</span>
          <br />
          <span className="text-xs text-neutral-400">({factItem})</span>
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
