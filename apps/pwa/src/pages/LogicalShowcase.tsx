import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
   Code,
   Play,
   Pause,
   RotateCcw,
   Check,
   Copy,
   Sparkles,
   Cpu,
   Search,
   CheckCircle2,
   XCircle,
   Terminal,
   ChevronDown,
   ChevronUp,
   Zap,
   MousePointerClick,
   Image as ImageIcon,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*                              Helper Card View                              */
/* -------------------------------------------------------------------------- */

interface DemoCardProps {
   id: string
   title: string
   description: string
   category: string
   complexity?: string
   codeSnippet: string
   children: React.ReactNode
}

const DemoCard: React.FC<DemoCardProps> = ({ id, title, description, category, complexity, codeSnippet, children }) => {
   const [showCode, setShowCode] = useState(false)
   const [copied, setCopied] = useState(false)

   const handleCopy = () => {
      navigator.clipboard.writeText(codeSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
   }

   return (
      <div
         id={id}
         className="group relative flex flex-col rounded-2xl border border-border bg-card/60 p-5 md:p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-md"
      >
         {/* Header */}
         <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                     {category}
                  </span>
                  {complexity && (
                     <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Cpu className="w-3 h-3" /> {complexity}
                     </span>
                  )}
               </div>
               <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{title}</h3>
               <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>

            <button
               onClick={() => setShowCode(!showCode)}
               className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
               <Code className="w-3.5 h-3.5" />
               {showCode ? 'Hide Logic' : 'View Code'}
               {showCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
         </div>

         {/* Expandable Code Drawer */}
         {showCode && (
            <div className="mb-4 rounded-xl border border-border/80 bg-slate-950 p-4 text-slate-50 text-xs overflow-x-auto shadow-inner relative">
               <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                     <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Source Implementation
                  </span>
                  <button
                     onClick={handleCopy}
                     className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                     {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                     {copied ? 'Copied' : 'Copy'}
                  </button>
               </div>
               <pre className="font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">{codeSnippet}</pre>
            </div>
         )}

         {/* Interactive Playground Content */}
         <div className="mt-auto pt-2">{children}</div>
      </div>
   )
}

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export default function LogicalShowcase() {
   const [searchQuery, setSearchQuery] = useState('')
   const [activeTab, setActiveTab] = useState('all')

   /* -------------------------- 1. Traffic Light State -------------------------- */
   const [activeSignal, setActiveSignal] = useState<'red' | 'yellow' | 'green'>('red')
   const [signalTimer, setSignalTimer] = useState(4)
   const [isSignalAuto, setIsSignalAuto] = useState(true)

   const signalTimeData = useMemo(
      () => ({
         red: 4,
         green: 2,
         yellow: 1,
      }),
      [],
   )

   useEffect(() => {
      if (!isSignalAuto) return

      const interval = setInterval(() => {
         setSignalTimer((prev) => {
            if (prev <= 1) {
               let nextSignal: 'red' | 'yellow' | 'green' = 'green'
               if (activeSignal === 'red') nextSignal = 'green'
               else if (activeSignal === 'green') nextSignal = 'yellow'
               else nextSignal = 'red'

               setActiveSignal(nextSignal)
               return signalTimeData[nextSignal]
            }
            return prev - 1
         })
      }, 1000)

      return () => clearInterval(interval)
   }, [activeSignal, isSignalAuto, signalTimeData])

   /* -------------------------- 2. Image Upload Preview -------------------------- */
   const [previewImage, setPreviewImage] = useState<string>('')
   const [imageDetails, setImageDetails] = useState<{ name: string; size: string; type: string } | null>(null)

   const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (file) {
         setImageDetails({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
         })
         const imageReader = new FileReader()
         imageReader.onload = () => {
            setPreviewImage(imageReader.result as string)
         }
         imageReader.readAsDataURL(file)
      }
   }

   /* -------------------------- 3. Debounced Click -------------------------- */
   const incrementRef = useRef<any>(null)
   const [rawClicks, setRawClicks] = useState(0)
   const [debouncedClicks, setDebouncedClicks] = useState(0)
   const [isDebouncing, setIsDebouncing] = useState(false)

   const onDebounceClick = () => {
      setRawClicks((prev) => prev + 1)
      setIsDebouncing(true)

      if (incrementRef.current) {
         clearTimeout(incrementRef.current)
      }
      incrementRef.current = setTimeout(() => {
         setDebouncedClicks((prev) => prev + 1)
         setIsDebouncing(false)
      }, 500)
   }

   /* ----------------------- 4. Flatten Nested Object ----------------------- */
   const defaultNestedObj = JSON.stringify(
      {
         user: {
            name: 'Alice',
            address: {
               city: 'London',
               zip: '12345',
            },
         },
         active: true,
         role: 'Developer',
      },
      null,
      2,
   )
   const [nestedJsonInput, setNestedJsonInput] = useState(defaultNestedObj)

   const flattenedOutput = useMemo(() => {
      try {
         const parsed = JSON.parse(nestedJsonInput)
         const flatten = (obj: any, prefix = '', result: Record<string, any> = {}) => {
            for (const key in obj) {
               if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  const newKey = prefix ? `${prefix}.${key}` : key
                  if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                     flatten(obj[key], newKey, result)
                  } else {
                     result[newKey] = obj[key]
                  }
               }
            }
            return result
         }
         return flatten(parsed)
      } catch {
         return { error: 'Invalid JSON Object structure' }
      }
   }, [nestedJsonInput])

   /* ----------------------- 5. Find Duplicate Numbers ----------------------- */
   const [dupInput, setDupInput] = useState('1, 2, 1, 3, 4, 5, 2, 5')
   const dupResult = useMemo(() => {
      const arr = dupInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      const counts: Record<number, number> = {}
      for (const key of arr) {
         counts[key] = (counts[key] || 0) + 1
      }

      const duplicates = Object.entries(counts)
         .filter(([_, count]) => count > 1)
         .map(([val, count]) => ({ num: Number(val), count }))

      return { arr, counts, duplicates }
   }, [dupInput])

   /* ----------------------- 6. Most Frequent Element ----------------------- */
   const [mostFreqInput, setMostFreqInput] = useState('1, 2, 1, 3, 4, 5, 5, 5, 5, 5, 2, 2')

   const mostFreqResult = useMemo(() => {
      const arr = mostFreqInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '')

      if (arr.length === 0) return { winner: 'N/A', count: 0, counts: {} }

      // Iterative Loop
      let maxCount = 0
      const counts: Record<string, number> = {}
      let mostFreq = ''
      for (const value of arr) {
         counts[value] = (counts[value] || 0) + 1
         if (counts[value] > maxCount) {
            maxCount = counts[value]
            mostFreq = value
         }
      }

      // Functional Reduce
      const reduceCounts = arr.reduce((acc: Record<string, number>, value) => {
         acc[value] = (acc[value] || 0) + 1
         return acc
      }, {})
      const reduceWinner =
         Object.keys(reduceCounts).length > 0
            ? Object.keys(reduceCounts).reduce((a, b) => (reduceCounts[a] > reduceCounts[b] ? a : b))
            : 'N/A'

      return { winner: mostFreq, count: maxCount, counts, reduceWinner }
   }, [mostFreqInput])

   /* ------------------ 7. First Non-Repeating Element ------------------ */
   const [uniqueElemInput, setUniqueElemInput] = useState('2, 3, 4, 2, 3, 5, 4')
   const uniqueElemResult = useMemo(() => {
      const arr = uniqueElemInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '')

      const counts = arr.reduce((acc: Record<string, number>, value) => {
         acc[value] = (acc[value] || 0) + 1
         return acc
      }, {})

      const firstUnique = arr.find((val) => counts[val] === 1) || null
      return { firstUnique, counts, arr }
   }, [uniqueElemInput])

   /* ------------------- 8. Top K Most Frequent Elements ------------------- */
   const [topKArrayInput, setTopKArrayInput] = useState('1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 2')
   const [topKValue, setTopKValue] = useState(2)

   const topKResult = useMemo(() => {
      const arr = topKArrayInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      const counts = arr.reduce((acc: Record<number, number>, value) => {
         acc[value] = (acc[value] || 0) + 1
         return acc
      }, {})

      const sortedArray = Object.keys(counts)
         .map(Number)
         .sort((a, b) => counts[b] - counts[a])

      return {
         topK: sortedArray.slice(0, topKValue),
         rankings: sortedArray.map((val) => ({ val, count: counts[val] })),
      }
   }, [topKArrayInput, topKValue])

   /* ------------------- 9. Find Missing Number 1 to N ------------------- */
   const [missingInput, setMissingInput] = useState('1, 2, 3, 5, 6')
   const missingResult = useMemo(() => {
      const arr = missingInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      const n = arr.length + 1
      const expectedSum = (n * (n + 1)) / 2
      const actualSum = arr.reduce((acc, value) => acc + value, 0)
      const missing = expectedSum - actualSum

      return { missing, expectedSum, actualSum, n, arr }
   }, [missingInput])

   /* ------------------- 10. Move Zeros to the End ------------------- */
   const [zerosInput, setZerosInput] = useState('0, 0, 1, 2, 0, 4, 3, 0, 5')
   const zerosResult = useMemo(() => {
      const arr = zerosInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      const result = [...arr]
      let zeroIndex = 0
      for (let i = 0; i < result.length; i++) {
         if (result[i] !== 0) {
            result[zeroIndex] = result[i]
            zeroIndex++
         }
      }
      for (let i = zeroIndex; i < result.length; i++) {
         result[i] = 0
      }

      return { original: arr, shifted: result }
   }, [zerosInput])

   /* ----------------- 11. First Non-Repeating Character ----------------- */
   const [nonRepCharInput, setNonRepCharInput] = useState('swiss')
   const nonRepCharResult = useMemo(() => {
      const count: Record<string, number> = {}
      for (const char of nonRepCharInput) {
         count[char] = (count[char] || 0) + 1
      }

      let firstChar: string | null = null
      for (const char of nonRepCharInput) {
         if (count[char] === 1) {
            firstChar = char
            break
         }
      }

      return { firstChar, count }
   }, [nonRepCharInput])

   /* ------------------- 12. Character Frequency Sort ------------------- */
   const [freqSortInput, setFreqSortInput] = useState('bbbaaacccccccc')
   const freqSortResult = useMemo(() => {
      const counts: Record<string, number> = {}
      for (const char of freqSortInput) {
         counts[char] = (counts[char] || 0) + 1
      }
      const sortedArray = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
      const sortedString = sortedArray.map((char) => char.repeat(counts[char])).join('')

      return { sortedString, counts }
   }, [freqSortInput])

   /* ------------------- 13. Valid Anagram Check ------------------- */
   const [anagramS, setAnagramS] = useState('anagram')
   const [anagramT, setAnagramT] = useState('nagaram')
   const anagramResult = useMemo(() => {
      if (anagramS.length !== anagramT.length) return { isAnagram: false, counts: {} }

      const counts: Record<string, number> = {}
      for (let i = 0; i < anagramS.length; i++) {
         counts[anagramS[i]] = (counts[anagramS[i]] || 0) + 1
         counts[anagramT[i]] = (counts[anagramT[i]] || 0) - 1
      }

      let isAnagram = true
      for (const char in counts) {
         if (counts[char] !== 0) {
            isAnagram = false
            break
         }
      }

      return { isAnagram, counts }
   }, [anagramS, anagramT])

   /* --------------------- 14. Two Sum II Sorted --------------------- */
   const [twoSumInput, setTwoSumInput] = useState('2, 5, 7, 10, 20')
   const [twoSumTarget, setTwoSumTarget] = useState(12)

   const twoSumResult = useMemo(() => {
      const numbers = twoSumInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      let left = 0
      let right = numbers.length - 1
      let foundPair: [number, number] | null = null
      let foundIndices: [number, number] | null = null

      while (left < right) {
         const sum = numbers[left] + numbers[right]
         if (sum === twoSumTarget) {
            foundPair = [numbers[left], numbers[right]]
            foundIndices = [left + 1, right + 1]
            break
         }
         if (sum < twoSumTarget) {
            left++
         } else {
            right--
         }
      }

      return { numbers, foundPair, foundIndices }
   }, [twoSumInput, twoSumTarget])

   /* --------------------- 15. Valid Palindrome --------------------- */
   const [palindromeInput, setPalindromeInput] = useState('A man, a plan, a canal: Panama')
   const palindromeResult = useMemo(() => {
      const isAlphaNumeric = (char: string) => /[a-zA-Z0-9]/.test(char)
      const s = palindromeInput
      let left = 0
      let right = s.length - 1
      let isValid = true

      while (left < right) {
         while (left < right && !isAlphaNumeric(s[left])) left++
         while (left < right && !isAlphaNumeric(s[right])) right--
         if (s[left]?.toLowerCase() !== s[right]?.toLowerCase()) {
            isValid = false
            break
         }
         left++
         right--
      }

      const cleaned = s.split('').filter(isAlphaNumeric).join('').toLowerCase()
      return { isValid, cleaned }
   }, [palindromeInput])

   /* --------------------- 16. 3Sum Triplets --------------------- */
   const [threeSumInput, setThreeSumInput] = useState('-1, 0, 1, 2, -1, -4')
   const threeSumResult = useMemo(() => {
      const nums = threeSumInput
         .split(',')
         .map((s) => s.trim())
         .filter((s) => s !== '' && !isNaN(Number(s)))
         .map(Number)

      const result: [number, number, number][] = []
      const sorted = [...nums].sort((a, b) => a - b)

      for (let i = 0; i < sorted.length - 2; i++) {
         if (i > 0 && sorted[i] === sorted[i - 1]) continue

         let left = i + 1
         let right = sorted.length - 1

         while (left < right) {
            const sum = sorted[i] + sorted[left] + sorted[right]
            if (sum === 0) {
               result.push([sorted[i], sorted[left], sorted[right]])
               while (left < right && sorted[left] === sorted[left + 1]) left++
               while (left < right && sorted[right] === sorted[right - 1]) right--
               left++
               right--
            } else if (sum < 0) {
               left++
            } else {
               right--
            }
         }
      }

      return { triplets: result, sorted }
   }, [threeSumInput])

   /* ---------------- Filter & Search Logic ---------------- */
   const demoItems = [
      {
         id: 'signal',
         title: 'Traffic Light Signal Simulator',
         category: 'Async & State',
         query: 'traffic light signal timer state',
      },
      {
         id: 'image',
         title: 'Image Upload & Data Reader',
         category: 'Async & State',
         query: 'image upload reader preview data url',
      },
      {
         id: 'debounce',
         title: 'Debounced Click Tracker',
         category: 'Async & State',
         query: 'debounce click timeout ref count',
      },
      {
         id: 'flatten',
         title: 'Flatten Deeply Nested Object',
         category: 'Objects & Arrays',
         query: 'flatten nested object keys dot',
      },
      {
         id: 'duplicates',
         title: 'Find Duplicate Numbers',
         category: 'Objects & Arrays',
         query: 'duplicates numbers count frequency',
      },
      {
         id: 'most-freq',
         title: 'Most Frequent Element (Reduce)',
         category: 'Objects & Arrays',
         query: 'most frequent element reduce loop',
      },
      {
         id: 'unique-elem',
         title: 'First Non-Repeating Element',
         category: 'Objects & Arrays',
         query: 'unique non repeating element array',
      },
      {
         id: 'top-k',
         title: 'Top K Most Frequent Elements',
         category: 'Objects & Arrays',
         query: 'top k frequent elements sort',
      },
      {
         id: 'missing',
         title: 'Find Missing Number in Range (1..N)',
         category: 'Objects & Arrays',
         query: 'missing number sum formula 1 to n',
      },
      {
         id: 'zeros',
         title: 'Move All Zeros to End (In-Place)',
         category: 'Objects & Arrays',
         query: 'move zeros in place array shift',
      },
      {
         id: 'unique-char',
         title: 'First Non-Repeating Character',
         category: 'Strings & HashMaps',
         query: 'first unique non repeating char string swiss',
      },
      {
         id: 'freq-sort',
         title: 'Character Frequency Sort',
         category: 'Strings & HashMaps',
         query: 'frequency sort string descending count',
      },
      {
         id: 'anagram',
         title: 'Valid Anagram Check',
         category: 'Strings & HashMaps',
         query: 'anagram valid string balance count',
      },
      {
         id: 'twosum',
         title: 'Two Sum II (Sorted Array)',
         category: 'Two Pointers',
         query: 'two sum sorted array two pointers target',
      },
      {
         id: 'palindrome',
         title: 'Valid Palindrome Cleaner',
         category: 'Two Pointers',
         query: 'palindrome string alphanumeric pointer',
      },
      {
         id: 'threesum',
         title: '3Sum Zero Triplets',
         category: 'Two Pointers',
         query: '3sum zero sum triplets sorted pointer',
      },
   ]

   const visibleItems = useMemo(() => {
      return demoItems.filter((item) => {
         const matchesCategory =
            activeTab === 'all' ||
            (activeTab === 'state' && item.category === 'Async & State') ||
            (activeTab === 'arrays' && item.category === 'Objects & Arrays') ||
            (activeTab === 'strings' && item.category === 'Strings & HashMaps') ||
            (activeTab === 'pointers' && item.category === 'Two Pointers')

         const matchesQuery =
            searchQuery.trim() === '' ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.query.toLowerCase().includes(searchQuery.toLowerCase())

         return matchesCategory && matchesQuery
      })
   }, [activeTab, searchQuery])

   const isVisible = (id: string) => visibleItems.some((item) => item.id === id)

   return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center">
         <div className="w-full max-w-7xl flex flex-col gap-8">
            {/* Main Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6 md:p-10 shadow-lg">
               <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
               <div className="relative z-10 flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                     <Sparkles className="w-3.5 h-3.5" /> Interactive Algorithm & State Playground
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                     Logic Showcase & Live Visualizer
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
                     Test interactive state management, custom string parsing, frequency hash maps, mathematical
                     optimization algorithms, and two-pointer array operations in real-time.
                  </p>
               </div>

               {/* Filter & Search Bar */}
               <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
                  {/* Tab Switcher */}
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1 text-xs font-medium">
                     {[
                        { key: 'all', label: 'All Demos', count: demoItems.length },
                        { key: 'state', label: 'Async & State', count: 3 },
                        { key: 'arrays', label: 'Objects & Arrays', count: 7 },
                        { key: 'strings', label: 'Strings & HashMaps', count: 3 },
                        { key: 'pointers', label: 'Two Pointers', count: 3 },
                     ].map((tab) => (
                        <button
                           key={tab.key}
                           onClick={() => setActiveTab(tab.key)}
                           className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                              activeTab === tab.key
                                 ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                 : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                           }`}
                        >
                           {tab.label}
                           <span
                              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                 activeTab === tab.key
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-muted-foreground/20'
                              }`}
                           >
                              {tab.count}
                           </span>
                        </button>
                     ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search algorithms..."
                        className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                     />
                  </div>
               </div>
            </div>

            {/* Interactive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
               {/* 1. TRAFFIC LIGHT SIGNAL SIMULATOR */}
               {isVisible('signal') && (
                  <DemoCard
                     id="signal"
                     title="Traffic Light Signal Simulator"
                     description="Automatic state machine cycling Red (4s) -> Green (2s) -> Yellow (1s) with active countdown timer."
                     category="Async & State"
                     complexity="O(1) State Machine"
                     codeSnippet={`const [activeSignal, setActiveSignal] = useState("red");
const [signalTimer, setSignalTimer] = useState(4);

useEffect(() => {
    const interval = setInterval(() => {
        setSignalTimer((prev) => {
            if (prev <= 1) {
                const nextSignal = activeSignal === "red" ? "green" 
                                 : activeSignal === "green" ? "yellow" : "red";
                setActiveSignal(nextSignal);
                return signalTimeData[nextSignal];
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(interval);
}, [activeSignal]);`}
                  >
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border">
                           <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center gap-2 bg-slate-950 p-2.5 rounded-full border border-slate-800 shadow-inner">
                                 <span
                                    className={`w-8 h-8 rounded-full transition-all duration-300 ${
                                       activeSignal === 'red'
                                          ? 'bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.9)] scale-110'
                                          : 'bg-red-950/60 opacity-30'
                                    }`}
                                 />
                                 <span
                                    className={`w-8 h-8 rounded-full transition-all duration-300 ${
                                       activeSignal === 'yellow'
                                          ? 'bg-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.9)] scale-110'
                                          : 'bg-yellow-950/60 opacity-30'
                                    }`}
                                 />
                                 <span
                                    className={`w-8 h-8 rounded-full transition-all duration-300 ${
                                       activeSignal === 'green'
                                          ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.9)] scale-110'
                                          : 'bg-emerald-950/60 opacity-30'
                                    }`}
                                 />
                              </div>
                              <div>
                                 <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Active Signal
                                 </div>
                                 <div className="text-xl font-black capitalize flex items-center gap-2">
                                    <span
                                       className={
                                          activeSignal === 'red'
                                             ? 'text-red-500'
                                             : activeSignal === 'yellow'
                                               ? 'text-yellow-500'
                                               : 'text-emerald-500'
                                       }
                                    >
                                       {activeSignal}
                                    </span>
                                    <span className="text-xs font-mono font-normal bg-muted px-2 py-0.5 rounded-md border border-border">
                                       {signalTimer}s remaining
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col gap-2">
                              <button
                                 onClick={() => setIsSignalAuto(!isSignalAuto)}
                                 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    isSignalAuto
                                       ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                       : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                 }`}
                              >
                                 {isSignalAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                 {isSignalAuto ? 'Pause Auto' : 'Start Auto'}
                              </button>

                              <div className="flex gap-1">
                                 {(['red', 'yellow', 'green'] as const).map((sig) => (
                                    <button
                                       key={sig}
                                       onClick={() => {
                                          setActiveSignal(sig)
                                          setSignalTimer(signalTimeData[sig])
                                       }}
                                       className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                                          activeSignal === sig
                                             ? 'bg-primary text-primary-foreground border-primary'
                                             : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                                       }`}
                                    >
                                       {sig[0]}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 2. IMAGE UPLOAD PREVIEW */}
               {isVisible('image') && (
                  <DemoCard
                     id="image"
                     title="Image Upload & Data Reader"
                     description="Instant asynchronous file binary reading and base64 preview encoding using FileReader."
                     category="Async & State"
                     complexity="O(N) File Stream"
                     codeSnippet={`const onImageUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
        const imageReader = new FileReader();
        imageReader.onload = () => {
            setPreviewImage(imageReader.result as string);
        };
        imageReader.readAsDataURL(file);
    }
};`}
                  >
                     <div className="flex flex-col gap-4">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all text-center group">
                           <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                           <span className="text-xs font-semibold text-foreground">Click to upload an image</span>
                           <span className="text-[11px] text-muted-foreground">PNG, JPG, JPEG supported</span>
                           <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={onImageUpload}
                              className="hidden"
                           />
                        </label>

                        {previewImage ? (
                           <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
                              <img
                                 src={previewImage}
                                 alt="Uploaded Preview"
                                 className="w-16 h-16 object-cover rounded-lg border border-border shadow-sm"
                              />
                              <div className="flex-1 min-w-0 text-xs">
                                 <div className="font-semibold truncate">{imageDetails?.name}</div>
                                 <div className="text-muted-foreground">{imageDetails?.size}</div>
                                 <div className="text-muted-foreground text-[10px]">{imageDetails?.type}</div>
                              </div>
                              <button
                                 onClick={() => {
                                    setPreviewImage('')
                                    setImageDetails(null)
                                 }}
                                 className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                 <XCircle className="w-4 h-4" />
                              </button>
                           </div>
                        ) : (
                           <div className="text-xs text-center text-muted-foreground bg-muted/20 py-3 rounded-xl border border-dashed border-border">
                              No image uploaded yet
                           </div>
                        )}
                     </div>
                  </DemoCard>
               )}

               {/* 3. DEBOUNCED CLICK TRACKER */}
               {isVisible('debounce') && (
                  <DemoCard
                     id="debounce"
                     title="Debounced Click Tracker"
                     description="Prevents rapid consecutive event triggers by waiting for a 500ms quiet window."
                     category="Async & State"
                     complexity="O(1) Timer Ref"
                     codeSnippet={`const incrementRef = useRef(0);

const onClick = () => {
    if (incrementRef.current) {
        clearTimeout(incrementRef.current);
    }
    incrementRef.current = setTimeout(() => {
        console.log("Registered Click");
    }, 500);
};`}
                  >
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                           <button
                              onClick={onDebounceClick}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                           >
                              <MousePointerClick className="w-4 h-4" /> Rapid Click Me!
                           </button>
                           <button
                              onClick={() => {
                                 setRawClicks(0)
                                 setDebouncedClicks(0)
                              }}
                              className="p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Reset Counters"
                           >
                              <RotateCcw className="w-4 h-4" />
                           </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                           <div className="p-3 bg-muted/30 rounded-xl border border-border">
                              <div className="text-[11px] text-muted-foreground font-medium">Raw Rapid Clicks</div>
                              <div className="text-2xl font-black text-foreground mt-1">{rawClicks}</div>
                           </div>
                           <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                              <div className="text-[11px] text-primary font-medium flex items-center justify-center gap-1">
                                 Debounced (500ms)
                                 {isDebouncing && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                              </div>
                              <div className="text-2xl font-black text-primary mt-1">{debouncedClicks}</div>
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 4. FLATTEN DEEPLY NESTED OBJECT */}
               {isVisible('flatten') && (
                  <DemoCard
                     id="flatten"
                     title="Flatten Deeply Nested Object"
                     description="Converts nested key-value objects into flat single-level objects with dot-notation keys."
                     category="Objects & Arrays"
                     complexity="O(N) Recursive Stack"
                     codeSnippet={`function flattenObject(obj, prefix = '', result = {}) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = prefix ? \`\${prefix}.\${key}\` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                flattenObject(obj[key], newKey, result);
            } else {
                result[newKey] = obj[key];
            }
        }
    }
    return result;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <div className="text-xs font-semibold text-muted-foreground">Input JSON Object:</div>
                        <textarea
                           value={nestedJsonInput}
                           onChange={(e) => setNestedJsonInput(e.target.value)}
                           rows={4}
                           className="w-full rounded-xl border border-border bg-slate-950 p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="text-xs font-semibold text-muted-foreground mt-1">Flattened Output:</div>
                        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs font-mono text-foreground max-h-36 overflow-y-auto">
                           <pre>{JSON.stringify(flattenedOutput, null, 2)}</pre>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 5. FIND DUPLICATE NUMBERS */}
               {isVisible('duplicates') && (
                  <DemoCard
                     id="duplicates"
                     title="Find Duplicate Numbers"
                     description="Identifies elements occurring more than once and calculates total occurrences."
                     category="Objects & Arrays"
                     complexity="O(N) Hash Frequency"
                     codeSnippet={`function findDuplicates(arr) {
    const counts = {};
    for (const key of arr) {
        counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Input Array (comma separated):
                        </label>
                        <input
                           type="text"
                           value={dupInput}
                           onChange={(e) => setDupInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex flex-wrap gap-2 mt-2">
                           {dupResult.duplicates.length > 0 ? (
                              dupResult.duplicates.map(({ num, count }) => (
                                 <span
                                    key={num}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
                                 >
                                    <Zap className="w-3 h-3" /> Duplicate: {num} ({count}x)
                                 </span>
                              ))
                           ) : (
                              <span className="text-xs text-muted-foreground italic">No duplicates found!</span>
                           )}
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 6. MOST FREQUENT ELEMENT */}
               {isVisible('most-freq') && (
                  <DemoCard
                     id="most-freq"
                     title="Most Frequent Element (Loop & Reduce)"
                     description="Returns the single element occurring most frequently using iterative loop and reduce()."
                     category="Objects & Arrays"
                     complexity="O(N) Time"
                     codeSnippet={`// Loop Approach
function mostFrequent(arr) {
    let maxCount = 0; const counts = {}; let mostFreq = '';
    for (const value of arr) {
        counts[value] = (counts[value] || 0) + 1;
        if (counts[value] > maxCount) {
            maxCount = counts[value]; mostFreq = value;
        }
    }
    return { mostFreq, maxCount };
}

// Functional Reduce Approach
function mostFrequentReduce(arr) {
    const counts = arr.reduce((c, v) => { c[v] = (c[v] || 0) + 1; return c; }, {});
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Input Items (comma separated):
                        </label>
                        <input
                           type="text"
                           value={mostFreqInput}
                           onChange={(e) => setMostFreqInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="grid grid-cols-2 gap-3 mt-1">
                           <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                              <div className="text-[11px] text-primary font-medium">Winner Element</div>
                              <div className="text-2xl font-black text-primary mt-1">{mostFreqResult.winner}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                 {mostFreqResult.count} occurrences
                              </div>
                           </div>
                           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                 Reduce Output
                              </div>
                              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                 {mostFreqResult.reduceWinner}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">Functional Reduce</div>
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 7. FIRST NON-REPEATING ELEMENT */}
               {isVisible('unique-elem') && (
                  <DemoCard
                     id="unique-elem"
                     title="First Non-Repeating Element"
                     description="Returns the first element in an array that appears exactly once."
                     category="Objects & Arrays"
                     complexity="O(N) Hash Pass"
                     codeSnippet={`function findUnique(arr) {
    const counts = arr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    for (let item of arr) {
        if (counts[item] === 1) return item;
    }
    return null;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Input Items (comma separated):
                        </label>
                        <input
                           type="text"
                           value={uniqueElemInput}
                           onChange={(e) => setUniqueElemInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border mt-1">
                           <span className="text-xs text-muted-foreground">First Unique Item:</span>
                           {uniqueElemResult.firstUnique !== null ? (
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                 <CheckCircle2 className="w-4 h-4" /> {uniqueElemResult.firstUnique}
                              </span>
                           ) : (
                              <span className="text-xs text-muted-foreground italic">None found</span>
                           )}
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 8. TOP K MOST FREQUENT ELEMENTS */}
               {isVisible('top-k') && (
                  <DemoCard
                     id="top-k"
                     title="Top K Most Frequent Elements"
                     description="Extracts the top K elements sorted by frequency."
                     category="Objects & Arrays"
                     complexity="O(N log N) Sort"
                     codeSnippet={`function mostFrequentK(arr, k) {
    const counts = arr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    const sortedArray = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(Number);
    return sortedArray.slice(0, k);
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2">
                           <div className="col-span-2">
                              <label className="text-xs font-semibold text-muted-foreground">Input Array:</label>
                              <input
                                 type="text"
                                 value={topKArrayInput}
                                 onChange={(e) => setTopKArrayInput(e.target.value)}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-muted-foreground">Top K Value:</label>
                              <input
                                 type="number"
                                 min={1}
                                 max={10}
                                 value={topKValue}
                                 onChange={(e) => setTopKValue(Number(e.target.value))}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs text-muted-foreground">Top {topKValue} Output:</span>
                           <div className="flex gap-1.5 flex-wrap">
                              {topKResult.topK.map((val) => (
                                 <span
                                    key={val}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm"
                                 >
                                    {val}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 9. FIND MISSING NUMBER */}
               {isVisible('missing') && (
                  <DemoCard
                     id="missing"
                     title="Find Missing Number in Range (1 to N)"
                     description="Calculates missing number in O(n) time using the arithmetic sum formula [n * (n + 1) / 2]."
                     category="Objects & Arrays"
                     complexity="O(N) Time | O(1) Space"
                     codeSnippet={`function findMissingNumber(arr) {
    const n = arr.length + 1;
    const expectedSum = (n * (n + 1)) / 2;
    const actualSum = arr.reduce((acc, value) => acc + value, 0);
    return expectedSum - actualSum;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Array 1..N (missing 1 element):
                        </label>
                        <input
                           type="text"
                           value={missingInput}
                           onChange={(e) => setMissingInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="grid grid-cols-3 gap-2 text-center mt-1">
                           <div className="p-2.5 bg-muted/30 rounded-xl border border-border">
                              <div className="text-[10px] text-muted-foreground font-medium">Expected Sum</div>
                              <div className="text-base font-bold text-foreground">{missingResult.expectedSum}</div>
                           </div>
                           <div className="p-2.5 bg-muted/30 rounded-xl border border-border">
                              <div className="text-[10px] text-muted-foreground font-medium">Actual Sum</div>
                              <div className="text-base font-bold text-foreground">{missingResult.actualSum}</div>
                           </div>
                           <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <div className="text-[10px] text-red-500 font-medium">Missing Item</div>
                              <div className="text-base font-black text-red-500">{missingResult.missing}</div>
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 10. MOVE ZEROS TO THE END */}
               {isVisible('zeros') && (
                  <DemoCard
                     id="zeros"
                     title="Move All Zeros to End (In-Place)"
                     description="Shifts all 0s to the end of the array while preserving non-zero relative order."
                     category="Objects & Arrays"
                     complexity="O(N) In-Place"
                     codeSnippet={`function moveZeroToTheEnd(arr) {
    let zeroIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            arr[zeroIndex] = arr[i];
            zeroIndex++;
        }
    }
    for (let i = zeroIndex; i < arr.length; i++) {
        arr[i] = 0;
    }
    return arr;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Input Array (comma separated):
                        </label>
                        <input
                           type="text"
                           value={zerosInput}
                           onChange={(e) => setZerosInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex flex-col gap-2 mt-1">
                           <span className="text-[11px] text-muted-foreground">Reordered Output:</span>
                           <div className="flex flex-wrap gap-1.5">
                              {zerosResult.shifted.map((num, i) => (
                                 <span
                                    key={i}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                       num === 0
                                          ? 'bg-slate-900 text-slate-500 border-slate-800'
                                          : 'bg-primary/10 text-primary border-primary/20'
                                    }`}
                                 >
                                    {num}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 11. FIRST NON-REPEATING CHARACTER */}
               {isVisible('unique-char') && (
                  <DemoCard
                     id="unique-char"
                     title="First Non-Repeating Character"
                     description="Finds the first unique character in a string."
                     category="Strings & HashMaps"
                     complexity="O(N) String Pass"
                     codeSnippet={`function findNorRepeatingChar(s) {
    const count = {};
    for (const char of s) {
        count[char] = (count[char] || 0) + 1;
    }
    for (const char of s) {
        if (count[char] === 1) return char;
    }
    return null;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">Input String:</label>
                        <input
                           type="text"
                           value={nonRepCharInput}
                           onChange={(e) => setNonRepCharInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border mt-1">
                           <span className="text-xs text-muted-foreground">First Unique Character:</span>
                           {nonRepCharResult.firstChar ? (
                              <span className="inline-flex items-center gap-1.5 text-base font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                 "{nonRepCharResult.firstChar}"
                              </span>
                           ) : (
                              <span className="text-xs text-muted-foreground italic">None (all repeat)</span>
                           )}
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 12. CHARACTER FREQUENCY SORT */}
               {isVisible('freq-sort') && (
                  <DemoCard
                     id="freq-sort"
                     title="Character Frequency Sort"
                     description="Sorts characters in descending order based on their frequency."
                     category="Strings & HashMaps"
                     complexity="O(N log N) Frequency Sort"
                     codeSnippet={`function frequencySort(s) {
    const counts = {};
    for (const char of s) {
        counts[char] = (counts[char] || 0) + 1;
    }
    const sortedArray = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return sortedArray.map((char) => char.repeat(counts[char])).join("");
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">Input String:</label>
                        <input
                           type="text"
                           value={freqSortInput}
                           onChange={(e) => setFreqSortInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex flex-col gap-1.5 mt-1">
                           <span className="text-[11px] text-muted-foreground">Sorted Result:</span>
                           <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-mono text-sm tracking-wider font-bold truncate">
                              {freqSortResult.sortedString}
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 13. VALID ANAGRAM CHECK */}
               {isVisible('anagram') && (
                  <DemoCard
                     id="anagram"
                     title="Valid Anagram Check (Without Sorting)"
                     description="Determines if string t is a valid anagram of s in O(n) without using .sort()."
                     category="Strings & HashMaps"
                     complexity="O(N) Character Balance"
                     codeSnippet={`function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const counts = {};
    for (let i = 0; i < s.length; i++) {
        counts[s[i]] = (counts[s[i]] || 0) + 1;
        counts[t[i]] = (counts[t[i]] || 0) - 1;
    }
    for (const char in counts) {
        if (counts[char] !== 0) return false;
    }
    return true;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                              <label className="text-[11px] font-semibold text-muted-foreground">String S:</label>
                              <input
                                 type="text"
                                 value={anagramS}
                                 onChange={(e) => setAnagramS(e.target.value)}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                           <div>
                              <label className="text-[11px] font-semibold text-muted-foreground">String T:</label>
                              <input
                                 type="text"
                                 value={anagramT}
                                 onChange={(e) => setAnagramT(e.target.value)}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                        </div>

                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border mt-1">
                           <span className="text-xs text-muted-foreground">Anagram Result:</span>
                           {anagramResult.isAnagram ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                 <CheckCircle2 className="w-4 h-4" /> Valid Anagram
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-lg border border-destructive/20">
                                 <XCircle className="w-4 h-4" /> Not Anagram
                              </span>
                           )}
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 14. TWO SUM II (SORTED ARRAY) */}
               {isVisible('twosum') && (
                  <DemoCard
                     id="twosum"
                     title="Two Sum II (Sorted Array)"
                     description="Finds 1-indexed pair adding up to target using O(1) space two-pointer approach."
                     category="Two Pointers"
                     complexity="O(N) Time | O(1) Space"
                     codeSnippet={`function twoSumSorted(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        if (sum === target) {
            return [left + 1, right + 1];
        }
        if (sum < target) left++;
        else right--;
    }
    return false;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2">
                           <div className="col-span-2">
                              <label className="text-[11px] font-semibold text-muted-foreground">Sorted Numbers:</label>
                              <input
                                 type="text"
                                 value={twoSumInput}
                                 onChange={(e) => setTwoSumInput(e.target.value)}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                           <div>
                              <label className="text-[11px] font-semibold text-muted-foreground">Target Sum:</label>
                              <input
                                 type="number"
                                 value={twoSumTarget}
                                 onChange={(e) => setTwoSumTarget(Number(e.target.value))}
                                 className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                           </div>
                        </div>

                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border mt-1">
                           <span className="text-xs text-muted-foreground">Pair Found:</span>
                           {twoSumResult.foundPair ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                                 Values: [{twoSumResult.foundPair.join(', ')}] | Indices: [
                                 {twoSumResult.foundIndices?.join(', ')}]
                              </span>
                           ) : (
                              <span className="text-xs text-muted-foreground italic">No matching pair found</span>
                           )}
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 15. VALID PALINDROME */}
               {isVisible('palindrome') && (
                  <DemoCard
                     id="palindrome"
                     title="Valid Palindrome Cleaner"
                     description="Filters out non-alphanumeric characters and checks palindrome using two pointers."
                     category="Two Pointers"
                     complexity="O(N) Two Pointer"
                     codeSnippet={`function isPalindrome(s) {
    let left = 0; let right = s.length - 1;
    const isAlphaNumeric = (c) => /[a-zA-Z0-9]/.test(c);
    while (left < right) {
        while (left < right && !isAlphaNumeric(s[left])) left++;
        while (left < right && !isAlphaNumeric(s[right])) right--;
        if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
        left++; right--;
    }
    return true;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">Input String:</label>
                        <input
                           type="text"
                           value={palindromeInput}
                           onChange={(e) => setPalindromeInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex flex-col gap-2 mt-1">
                           <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border">
                              <span className="text-xs text-muted-foreground">Status:</span>
                              {palindromeResult.isValid ? (
                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" /> Valid Palindrome
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-lg border border-destructive/20">
                                    <XCircle className="w-4 h-4" /> Invalid Palindrome
                                 </span>
                              )}
                           </div>
                           <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              Cleaned:{' '}
                              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">
                                 {palindromeResult.cleaned}
                              </code>
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}

               {/* 16. 3SUM TRIPLETS */}
               {isVisible('threesum') && (
                  <DemoCard
                     id="threesum"
                     title="3Sum (Triplets That Sum to Zero)"
                     description="Returns all unique triplets in an array summing up to 0 without duplicates."
                     category="Two Pointers"
                     complexity="O(N²) Sorted Two Pointer"
                     codeSnippet={`function threeSum(nums) {
    const result = [];
    nums.sort((a, b) => a - b);
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1;
        let right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return result;
}`}
                  >
                     <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-muted-foreground">
                           Input Numbers (comma separated):
                        </label>
                        <input
                           type="text"
                           value={threeSumInput}
                           onChange={(e) => setThreeSumInput(e.target.value)}
                           className="rounded-xl border border-border bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="flex flex-col gap-2 mt-1">
                           <span className="text-[11px] text-muted-foreground">Unique Zero-Sum Triplets:</span>
                           <div className="flex flex-wrap gap-2">
                              {threeSumResult.triplets.length > 0 ? (
                                 threeSumResult.triplets.map((triplet, idx) => (
                                    <span
                                       key={idx}
                                       className="inline-flex items-center gap-1 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary"
                                    >
                                       [{triplet.join(', ')}]
                                    </span>
                                 ))
                              ) : (
                                 <span className="text-xs text-muted-foreground italic">No triplets sum to zero</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </DemoCard>
               )}
            </div>
         </div>
      </div>
   )
}
