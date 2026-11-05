import { useState } from 'react'
import { colors } from '@tedoku/shared'

// Replace this with your actual APK download URL from Expo build
const APK_DOWNLOAD_URL = 'https://expo.dev/accounts/george-0zoemena/projects/tedoku/builds/latest'

export default function App() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primaryDarker} 0%, ${colors.sidebar} 50%, #1a0d2e 100%)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, ${colors.cycle}30 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Diagonal line accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '2px',
        height: '100%',
        background: `linear-gradient(180deg, transparent 0%, ${colors.primary}40 50%, transparent 100%)`,
        transform: 'translateX(50%) rotate(20deg)',
        transformOrigin: 'top',
      }} />

      {/* Navigation */}
      <nav style={{
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colors.surface,
          letterSpacing: '-0.5px',
        }}>
          tedoku
        </div>
        
        <a
          href="#download"
          style={{
            padding: '12px 28px',
            background: colors.surface,
            color: colors.primary,
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease',
          }}
        >
          Get the App
        </a>
      </nav>

      {/* Hero Section */}
      <main style={{
        padding: '80px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Left Content */}
        <div>
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: `${colors.successSoft}20`,
            borderRadius: '100px',
            marginBottom: '32px',
            border: `1px solid ${colors.successSoft}40`,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: colors.successSoft,
              boxShadow: `0 0 10px ${colors.successSoft}`,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '14px',
              color: colors.successSoft,
              fontWeight: 500,
            }}>
              Available Now
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            color: colors.surface,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-2px',
          }}>
            Your personal
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.primarySoft} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              health companion
            </span>
            <br />
            for wellness
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '18px',
            color: colors.primarySoft,
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '520px',
            opacity: 0.9,
          }}>
            Track your cycle, connect with healthcare providers, and take control 
            of your health journey with Tedoku's comprehensive wellness platform.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}>
            <a
              href={APK_DOWNLOAD_URL}
              download
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                padding: '18px 40px',
                background: isHovered 
                  ? colors.surface 
                  : `linear-gradient(135deg, ${colors.surface} 0%, ${colors.primarySoft} 100%)`,
                color: colors.primary,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                boxShadow: `0 20px 40px ${colors.primary}30`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              Download APK
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3.33334V13.3333M10 13.3333L14.1667 9.16668M10 13.3333L5.83333 9.16668M3.33333 16.6667H16.6667" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            <button
              style={{
                padding: '18px 40px',
                background: 'transparent',
                color: colors.surface,
                border: `2px solid ${colors.surface}40`,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.surface
                e.currentTarget.style.background = `${colors.surface}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${colors.surface}40`
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Learn more
            </button>
          </div>

          {/* Download Info */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.primarySoft,
            fontSize: '14px',
            opacity: 0.7,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" 
                stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5.33334V8.00001L9.66667 9.66668" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Android 8.0 or higher required</span>
          </div>
        </div>

        {/* Right Visual */}
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* 3D Glass Morphism Shape */}
          <div style={{
            width: '450px',
            height: '450px',
            position: 'relative',
            animation: 'float 6s ease-in-out infinite',
          }}>
            {/* Main shape */}
            <div style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${colors.primary}80 0%, ${colors.cycle}60 50%, ${colors.sleep}60 100%)`,
              borderRadius: '50% 50% 30% 50%',
              filter: 'blur(1px)',
              boxShadow: `
                0 30px 60px ${colors.primary}40,
                inset 0 -30px 60px ${colors.primary}30,
                inset 0 30px 60px ${colors.surface}20
              `,
              border: `1px solid ${colors.surface}20`,
              transform: 'rotate(-15deg)',
              animation: 'rotate 20s linear infinite',
            }} />

            {/* Inner glow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${colors.surface}30 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(40px)',
            }} />

            {/* Accent rings */}
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '-10%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: `2px solid ${colors.surface}20`,
              animation: 'float 8s ease-in-out infinite reverse',
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '-10%',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: `2px solid ${colors.cycle}30`,
              animation: 'float 10s ease-in-out infinite',
            }} />
          </div>
        </div>
      </main>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes rotate {
          from { transform: rotate(-15deg); }
          to { transform: rotate(345deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 968px) {
          main {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          
          h1 {
            font-size: 48px !important;
          }
          
          main > div:last-child {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
