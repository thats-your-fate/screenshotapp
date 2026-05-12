/* eslint-disable @next/next/no-img-element */
import { TrackedLink } from "@/components/analytics/tracked-link";
import { TemplateListPreview } from "@/components/editor/template-list-preview";
import { listPublishedTemplates } from "@/features/templates/service";

const deviceBadges = ["iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone 17", "Android"];

export default async function MarketingTemplatesPage() {
  const templates = await listPublishedTemplates();
  const featuredTemplates = templates
    .filter((template) => template.slug.startsWith("bg-") && !template.slug.startsWith("bg-android-"))
    .slice(0, 7);

  return (
    <div className="bg-white">
      <section
        className="fintech-app-home-section-1 position-relative overflow-hidden pt-250 pb-160 rounded-bottom-5 z-4"
        data-background="assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png"
        style={{
          backgroundColor: "var(--tc-theme-primary)",
          backgroundImage: "url('/assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <img
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover z-0"
          src="/assets/imgs/pages/fintech-app/page-home/home-section-1/img-bg.png"
          alt="AppShot Studio app store screenshot template preview"
        />
        <div className="container position-relative z-2 pt-8 text-center overflow-hidden">
          <span className="content-top btn-text text-white">TEMPLATE LIBRARY</span>
          <h1 className="title-stroke my-3 text-primary">
            Templates
            <span className="text-white">
              {" "}for <br />
              polished
            </span>
            <span className="text-secondary"> launches </span>
          </h1>
          <p className="fs-5 text-white opacity-75 mb-0 mx-auto" style={{ maxWidth: 720 }}>
            Browse published screenshot templates from the unique library and pick a starting point for your next store update.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">Featured templates</p>
            <h2 className="mt-2 text-3xl font-black !text-slate-950">Demo screenshot sets</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            A curated set of unique templates for the public frontend. Each preview shows the multi-screen screenshot layout.
          </p>
        </div>

        <div className="grid gap-6">
          {featuredTemplates.map((template) => (
            <article key={template.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <TemplateListPreview screens={template.editorScreens} />
              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black leading-tight !text-slate-950">{template.name}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{template.description || "No description yet."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {deviceBadges.map((device) => (
                      <span key={device} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
                <TrackedLink
                  href={`/sign-up?redirectTo=${encodeURIComponent(`/app/templates/${template.id}/use`)}`}
                  eventName="template_use_clicked"
                  eventParams={{ template_id: template.id, template_name: template.name }}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-950 !bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide !text-white transition hover:!bg-slate-800"
                >
                  Use this template
                </TrackedLink>
              </div>
            </article>
          ))}

          {featuredTemplates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
              No featured templates matched the configured names yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
