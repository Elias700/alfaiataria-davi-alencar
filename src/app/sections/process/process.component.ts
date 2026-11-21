import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { DESKTOP_MQ, DUR_L, MOBILE_MQ, STAGGER } from '../../core/animations/motion';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { CTA_LABEL, PROCESS } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-process',
  imports: [NgOptimizedImage, AnchorDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './process.component.scss',
  templateUrl: './process.component.html',
})
export class ProcessComponent {
  protected readonly p = PROCESS;
  protected readonly ctaLabel = CTA_LABEL;

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('area');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly thread = viewChild.required<ElementRef<HTMLElement>>('thread');

  constructor() {
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(this.area().nativeElement, destroyRef, ({ gsap, ScrollTrigger }) => {
        const area = this.area().nativeElement;
        const stage = this.stage().nativeElement;
        const track = this.track().nativeElement;
        const thread = this.thread().nativeElement;
        const titleLines = gsap.utils.toArray<HTMLElement>('.process__tl', area);
        const steps = gsap.utils.toArray<HTMLElement>('.step, .process__end', area);
        const mm = gsap.matchMedia();

        /**
         * A15 (.loc-scroll-area do clone): a área ganha altura igual ao trilho e o palco fica
         * sticky; o trilho anda no eixo X com scrub 0.25 e ease horScroll. As linhas do título
         * deslizam em sentidos alternados e cada etapa revela via containerAnimation.
         */
        mm.add(DESKTOP_MQ, () => {
          const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
          const setHeight = () => {
            area.style.height = `${distance() + window.innerHeight}px`;
          };
          setHeight();
          ScrollTrigger.addEventListener('refreshInit', setHeight);

          const st = {
            trigger: area,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.25,
            invalidateOnRefresh: true,
          };
          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: 'horScroll',
            scrollTrigger: st,
          });

          gsap.fromTo(
            titleLines,
            { xPercent: gsap.utils.wrap([-3, 6]) },
            { xPercent: gsap.utils.wrap([3, -8]), ease: 'none', scrollTrigger: { ...st } },
          );
          // A16: o "fio de costura" se desenha ao longo do trilho.
          gsap.fromTo(thread, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...st } });

          if (anim.animateReveals) {
            steps.forEach((step) => {
              gsap.fromTo(
                step.querySelectorAll('[data-step-part]'),
                { opacity: 0, y: 48 },
                {
                  opacity: 1,
                  y: 0,
                  duration: DUR_L,
                  stagger: STAGGER,
                  ease: 'Out',
                  scrollTrigger: {
                    trigger: step,
                    containerAnimation: tween,
                    start: 'left 88%',
                    once: true,
                  },
                },
              );
            });
          }

          ScrollTrigger.refresh();
          return () => {
            ScrollTrigger.removeEventListener('refreshInit', setHeight);
            area.style.height = '';
          };
        });

        // Mobile: pilha vertical; o fio vira uma linha vertical que acompanha o scroll.
        mm.add(MOBILE_MQ, () => {
          gsap.fromTo(
            thread,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 },
            },
          );
          if (!anim.animateReveals) return;
          steps.forEach((step) => {
            gsap.fromTo(
              step.querySelectorAll('[data-step-part]'),
              { opacity: 0, y: 32 },
              {
                opacity: 1,
                y: 0,
                duration: DUR_L,
                stagger: STAGGER,
                ease: 'Out',
                scrollTrigger: { trigger: step, start: 'top 88%', once: true },
              },
            );
          });
        });

        return () => mm.revert();
      });
    });
  }
}
