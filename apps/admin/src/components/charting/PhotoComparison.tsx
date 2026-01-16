'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Layers,
  SplitSquareHorizontal,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Move,
  ZoomIn,
  ZoomOut,
  Grid,
  AlignCenter,
  Play,
  Pause,
  Camera
} from 'lucide-react'
import { useChartingTheme } from '@/contexts/ChartingThemeContext'

// =============================================================================
// TYPES
// =============================================================================

export interface ComparisonPhoto {
  id: string
  url: string
  type: 'before' | 'after' | 'during' | 'progress'
  angle: string
  timestamp: Date
  notes?: string
}

type ComparisonMode = 'side-by-side' | 'slider' | 'ghosting' | 'toggle'

interface PhotoComparisonProps {
  beforePhoto: ComparisonPhoto | null
  afterPhoto: ComparisonPhoto | null
  onSwapPhotos?: () => void
  onDownload?: () => void
  className?: string
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PhotoComparison({
  beforePhoto,
  afterPhoto,
  onSwapPhotos,
  onDownload,
  className = ''
}: PhotoComparisonProps) {
  // Theme context for dark/light mode
  const { isDark } = useChartingTheme()

  // State
  const [mode, setComparisonMode] = useState<ComparisonMode>('slider')
  const [sliderPosition, setSliderPosition] = useState(50)
  const [ghostOpacity, setGhostOpacity] = useState(50)
  const [showAfter, setShowAfter] = useState(true) // For toggle mode
  const [isPlaying, setIsPlaying] = useState(false) // For auto-toggle
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  // Slider drag handler
  const handleSliderDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const position = ((clientX - rect.left) / rect.width) * 100

    setSliderPosition(Math.max(0, Math.min(100, position)))
  }, [])

  const handleSliderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    handleSliderDrag(e)
  }, [handleSliderDrag])

  const handleSliderMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleSliderDrag(e)
    }
  }, [isDragging, handleSliderDrag])

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for slider
  const handleSliderTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    handleSliderDrag(e)
  }, [handleSliderDrag])

  const handleSliderTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      handleSliderDrag(e)
    }
  }, [isDragging, handleSliderDrag])

  // Auto-toggle animation
  useEffect(() => {
    if (mode !== 'toggle' || !isPlaying) return

    const interval = setInterval(() => {
      setShowAfter(prev => !prev)
    }, 1500)

    return () => clearInterval(interval)
  }, [mode, isPlaying])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSliderPosition(50)
    setGhostOpacity(50)
  }, [])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!beforePhoto || !afterPhoto) {
    return (
      <div className={`flex items-center justify-center h-96 rounded-xl border-2 border-dashed ${
        isDark
          ? 'bg-gray-800 border-gray-600'
          : 'bg-gray-50 border-gray-300'
      } ${className}`}>
        <div className="text-center p-8">
          <Camera className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select Before & After Photos</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Choose photos to compare treatment results
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border shadow-sm overflow-hidden ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } ${className}`}
    >
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDark
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Compare:</span>

          {/* Mode Buttons */}
          <div className={`flex rounded-lg p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setComparisonMode('slider')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'slider'
                  ? isDark
                    ? 'bg-gray-600 text-purple-400 shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Slider comparison"
            >
              <SplitSquareHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setComparisonMode('ghosting')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'ghosting'
                  ? isDark
                    ? 'bg-gray-600 text-purple-400 shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Ghost overlay"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setComparisonMode('side-by-side')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'side-by-side'
                  ? isDark
                    ? 'bg-gray-600 text-purple-400 shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Side by side"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setComparisonMode('toggle')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'toggle'
                  ? isDark
                    ? 'bg-gray-600 text-purple-400 shadow-sm'
                    : 'bg-white text-purple-700 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle animation"
            >
              {showAfter ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alignment Guides */}
          <button
            onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
            className={`p-2 rounded-lg transition-colors ${
              showAlignmentGuides
                ? isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'
                : isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Toggle alignment guides"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          {/* Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid
                ? isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'
                : isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Zoom Controls */}
          <div className={`flex items-center gap-1 border-l pl-2 ml-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <button
              onClick={handleZoomOut}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-xs w-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={resetView}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download */}
          {onDownload && (
            <button
              onClick={onDownload}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Download comparison"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode-specific controls */}
      {mode === 'ghosting' && (
        <div className={`px-4 py-3 border-b flex items-center gap-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
        }`}>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Opacity:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={ghostOpacity}
            onChange={(e) => setGhostOpacity(parseInt(e.target.value))}
            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
          <span className={`text-sm w-12 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{ghostOpacity}%</span>
        </div>
      )}

      {mode === 'toggle' && (
        <div className={`px-4 py-3 border-b flex items-center justify-center gap-4 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
        }`}>
          <button
            onClick={() => setShowAfter(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showAfter
                ? 'bg-purple-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAfter ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            After
          </button>
        </div>
      )}

      {/* Comparison View */}
      <div
        className="relative bg-gray-900 overflow-hidden"
        style={{ height: isFullscreen ? '100vh' : '500px' }}
      >
        {/* Side by Side Mode */}
        {mode === 'side-by-side' && (
          <div className="flex h-full">
            <div className="flex-1 relative border-r border-gray-700">
              <img
                src={beforePhoto.url}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                }}
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                Before
              </div>
              {/* Overlay guides */}
              {showAlignmentGuides && <AlignmentGuides />}
              {showGrid && <GridOverlay />}
            </div>
            <div className="flex-1 relative">
              <img
                src={afterPhoto.url}
                alt="After"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                }}
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                After
              </div>
              {showAlignmentGuides && <AlignmentGuides />}
              {showGrid && <GridOverlay />}
            </div>
          </div>
        )}

        {/* Slider Mode */}
        {mode === 'slider' && (
          <div
            ref={sliderRef}
            className="relative h-full cursor-col-resize select-none"
            onMouseDown={handleSliderMouseDown}
            onMouseMove={handleSliderMouseMove}
            onMouseUp={handleSliderMouseUp}
            onMouseLeave={handleSliderMouseUp}
            onTouchStart={handleSliderTouchStart}
            onTouchMove={handleSliderTouchMove}
            onTouchEnd={handleSliderMouseUp}
          >
            {/* After photo (full width, underneath) */}
            <img
              src={afterPhoto.url}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
              }}
              draggable={false}
            />

            {/* Before photo (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforePhoto.url}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  minWidth: `${100 / (sliderPosition / 100)}%`
                }}
                draggable={false}
              />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="flex items-center gap-0.5">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              Before
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              After
            </div>

            {showAlignmentGuides && <AlignmentGuides />}
            {showGrid && <GridOverlay />}
          </div>
        )}

        {/* Ghosting Mode */}
        {mode === 'ghosting' && (
          <div className="relative h-full">
            {/* Before photo (base) */}
            <img
              src={beforePhoto.url}
              alt="Before"
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
              }}
            />

            {/* After photo (overlay with opacity) */}
            <img
              src={afterPhoto.url}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                opacity: ghostOpacity / 100,
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                mixBlendMode: 'normal'
              }}
            />

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              Before (Base)
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              After ({ghostOpacity}%)
            </div>

            {showAlignmentGuides && <AlignmentGuides />}
            {showGrid && <GridOverlay />}
          </div>
        )}

        {/* Toggle Mode */}
        {mode === 'toggle' && (
          <div className="relative h-full">
            <img
              src={showAfter ? afterPhoto.url : beforePhoto.url}
              alt={showAfter ? 'After' : 'Before'}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
              }}
            />

            {/* Label */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              {showAfter ? 'After' : 'Before'}
            </div>

            {showAlignmentGuides && <AlignmentGuides />}
            {showGrid && <GridOverlay />}
          </div>
        )}
      </div>

      {/* Photo Info */}
      <div className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
        isDark
          ? 'border-gray-700 bg-gray-800 text-gray-400'
          : 'border-gray-100 bg-gray-50 text-gray-500'
      }`}>
        <div className="flex items-center gap-4">
          <span>
            <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Before:</strong> {beforePhoto.angle} - {new Date(beforePhoto.timestamp).toLocaleDateString()}
          </span>
          <span>
            <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>After:</strong> {afterPhoto.angle} - {new Date(afterPhoto.timestamp).toLocaleDateString()}
          </span>
        </div>

        {onSwapPhotos && (
          <button
            onClick={onSwapPhotos}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Swap Photos
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function AlignmentGuides() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50 -translate-x-1/2" />

      {/* Horizontal center line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50 -translate-y-1/2" />

      {/* Eye level guide (approximate) */}
      <div className="absolute top-[35%] left-0 right-0 h-px bg-yellow-400/50" />

      {/* Nose line guide */}
      <div className="absolute top-[55%] left-0 right-0 h-px bg-yellow-400/30" />

      {/* Lip line guide */}
      <div className="absolute top-[65%] left-0 right-0 h-px bg-yellow-400/30" />
    </div>
  )
}

function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Rule of thirds vertical */}
      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />

      {/* Rule of thirds horizontal */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
    </div>
  )
}

// =============================================================================
// PHOTO CAPTURE GUIDE COMPONENT (for consistent photo capture)
// =============================================================================

interface PhotoCaptureGuideProps {
  ghostImage?: string // Previous photo to align to
  onCapture?: (file: File) => void
  angle: string
}

export function PhotoCaptureGuide({ ghostImage, onCapture, angle }: PhotoCaptureGuideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [ghostOpacity, setGhostOpacity] = useState(40)

  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${angle}-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture?.(file)
      }
    }, 'image/jpeg', 0.95)
  }, [angle, onCapture])

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Live video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
      />

      {/* Ghost overlay from previous photo */}
      {ghostImage && (
        <img
          src={ghostImage}
          alt="Alignment guide"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ opacity: ghostOpacity / 100 }}
        />
      )}

      {/* Alignment guides */}
      <AlignmentGuides />

      {/* Angle indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
        {angle}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {ghostImage && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-white text-sm">Ghost:</span>
            <input
              type="range"
              min="0"
              max="80"
              value={ghostOpacity}
              onChange={(e) => setGhostOpacity(parseInt(e.target.value))}
              className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-sm w-12">{ghostOpacity}%</span>
          </div>
        )}

        <button
          onClick={capturePhoto}
          className="w-full py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Capture Photo
        </button>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default PhotoComparison
