'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
// import '@/styles/globals.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Settings = {
  id?: string;
  site_title: string;
  tagline: string;
  logo_url: string;
  hero_name: string;
  hero_image: string;
  hero_description: string;
  about_description: string;
  trusted_title: string;
  trusted_description: string;
  location: string;
  phone: string;
  email: string;
  audio_title: string;
  audio_src: string;
  audio_button_text: string;
};

export default function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    AOS.init({ once: true, duration: 1000, easing: 'ease-in-out' });

    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setSettings(data);
        if (data.logo_url) {
          const { data: logoData } = supabase.storage
            .from(data.logo_url.split('/')[0])
            .getPublicUrl(data.logo_url.split('/')[1]);
          setLogoUrl(logoData.publicUrl);
        }
        if (data.hero_image) {
          const { data: heroData } = supabase.storage
            .from(data.hero_image.split('/')[0])
            .getPublicUrl(data.hero_image.split('/')[1]);
          setHeroImageUrl(heroData.publicUrl);
        }
        if (data.audio_src) {
          const { data: audioData } = supabase.storage
            .from(data.audio_src.split('/')[0])
            .getPublicUrl(data.audio_src.split('/')[1]);
          setAudioUrl(audioData.publicUrl);
        }
      }
      setLoading(false);
    };

    fetchSettings();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let step = 0;
    let cols: number, rows: number;

    const resizeCanvas = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      if (window.innerWidth >= 1024) {
        cols = 50;
        rows = 15;
      } else if (window.innerWidth >= 768) {
        cols = 35;
        rows = 12;
      } else {
        cols = 20;
        rows = 8;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);
      const spacingX = width / cols;
      const spacingY = height / rows;

      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const offsetX = x * spacingX;
          const perspective = 1 - y / rows;
          const offsetY =
            y * spacingY +
            Math.sin((x + step) * 0.3 + y * 0.2) * 10 * perspective;

          const radius = 3.2 * perspective;
          ctx.beginPath();
          ctx.arc(offsetX, offsetY, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 0, 0, 0.95)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      step += 0.15;
      if (window.innerWidth >= 360) {
        requestAnimationFrame(drawWave);
      }
    };

    drawWave();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleAudioPlay = () => {
    if (!isPlaying && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          alert('🔇 Browser blocked autoplay. Try clicking again!');
          console.error(err);
        });
    }
  };

  if (loading) return <div className="text-white text-center p-10">Loading...</div>;
  if (!settings) return <div className="text-white text-center p-10">No settings found.</div>;

  return (
    <div className="text-white">
      <header className={`fixed-header ${isScrolled ? 'shrink' : ''}`} id="main-header">
        <div className="header-content">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Logo"
              width={isScrolled ? 40 : 70}
              height={isScrolled ? 40 : 70}
              className="logo"
            />
          )}
          <div className="header-text">
            <h1>{settings.site_title}</h1>
            <p>{settings.tagline}</p>
          </div>
        </div>
      </header>

      <section className="hero">
        <canvas ref={canvasRef} id="waveCanvas" />
        <div className="hero-content">
          <h1>Staring: {settings.hero_name}</h1>
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={settings.hero_name}
              width={150}
              height={150}
              className="hero-img"
            />
          )}
          <h2>{settings.hero_description}</h2>
        </div>
      </section>

      <section className="about" data-aos="fade-up">
        <h2 className="section-title">About</h2>
        <p>{settings.about_description}</p>
      </section>

      <section className="services" data-aos="fade-up">
        <h2 className="section-title">Services</h2>
        <div className="service-item">
          <h3>Joki Tugas Coding</h3>
          <p>Merasa pusing untuk mengerjakan tugas kuliah / sekolah Anda? atau terlalu sibuk sampai tidak bisa mengerjakan tugas ngodingmu itu? sewa joki dariku untuk tugasmu itu saja dengan harga murah mulai dari Rp. 70.000,- (bisa di nego, chat saja)</p>
        </div>
        <div className="service-item">
          <h3>Tutor Coding</h3>
          <p>Butuh Tutor untuk Tugas Kuliah / Sekolah? saya siap memberikan tutor untuk anda, mulai dari Rp. 50.000,- untuk satu sesi pertemuan hingga tuntas.</p>
        </div>
        <div className="service-item">
          <h3>Membuat Website</h3>
          <p>Mau buat website pribadi? blog sendiri? situs marketing? kontak saja, aku sediakan dengan tawaran harga yang murah dan ramah di dompet.</p>
        </div>
      </section>

      <section className="skills" data-aos="fade-up">
        <h2 className="section-title">Skills</h2>
        <div className="skills-group">
          <div className="skill-category">
            <h3>Programming Languages</h3>
            <ul>
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>PHP</li>
              <li>Java</li>
              <li>C</li>
              <li>C#</li>
              <li>C++</li>
              <li>Go</li>
              <li>Python</li>
              <li>TypeScript</li>
              <li>Dart</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Frameworks & Libraries</h3>
            <ul>
              <li>Bootstrap</li>
              <li>Tailwind CSS</li>
              <li>DaisyUI</li>
              <li>Laravel</li>
              <li>node.js</li>
              <li>Express.js</li>
              <li>ReactJS</li>
              <li>Next.js</li>
              <li>Echo (Go)</li>
              <li>Flask</li>
              <li>.NET</li>
              <li>Django</li>
              <li>Flutter</li>
              <li>Play Framework</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Databases</h3>
            <ul>
              <li>SQL</li>
              <li>MySQL</li>
              <li>SQLite</li>
              <li>PostgreSQL</li>
              <li>MariaDB</li>
              <li>SQL Server</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="testimonies" data-aos="fade-up">
        <h2 className="section-title">Testimonies</h2>
        <div className="testimony">
          <p>seneng situsnya bagus sesuai request, adminnya ramah trus ngerti bgt semua penjelasan aku. makasi banyak yaa - Arini</p>
          <p>Service: Membuat Website</p>
        </div>
        <div className="testimony">
          <p>kerenn & fast bgt - Rinaldi</p>
          <p>Service: Tutor Coding</p>
        </div>
        <div className="testimony">
          <p>okok,ty deh bg ud bntu jokiin sampe sebagus gitu, mungkin gatau da gmna jadiny klo ga di bntuin dah - Andresta</p>
          <p>Service: Joki Tugas Coding</p>
        </div>
      </section>

      <section className="testimonies" data-aos="fade-up">
        <h2 className="section-title">{settings.trusted_title}</h2>
        <div className="testimony">
          <center>
            <p>{settings.trusted_description}</p>
          </center>
        </div>
      </section>

      <section className="contact" data-aos="fade-up">
        <h2 className="section-title">Contact Me / Hire Me</h2>
        <div className="contact-info">
          <p><strong>Location:</strong> {settings.location}</p>
          <p><strong>Phone:</strong> {settings.phone}</p>
          <p><strong>Email:</strong> {settings.email}</p>
          <br />
          <Link href={`mailto:${settings.email}`} className="contact-button">
            Contact Me on Email
          </Link>
          <br /><br />
          <Link href={`https://wa.me/${settings.phone.replace(/\+/g, '')}`} className="whatsapp-button">
            Contact Me on WhatsApp
          </Link>
        </div>
      </section>

      <footer>
        <p>© 2025 {settings.site_title}. All rights reserved.</p>
      </footer>

      <div
        onClick={handleAudioPlay}
        className="now-playing-button"
        dangerouslySetInnerHTML={{
          __html: isPlaying
            ? `🎵 Now Playing:<br><strong>${settings.audio_title}</strong>`
            : settings.audio_button_text,
        }}
      />
    </div>
  );
}
