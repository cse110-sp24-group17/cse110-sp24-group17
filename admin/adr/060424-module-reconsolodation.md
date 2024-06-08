# Module Reconsolidation
## Context
As outlined by our original tech spec ADR, the initial code architecture detailed separate html files each hosting their own components, which would then require each module to exist on separate pages in the webapp.
Our current situation now calls for a different approach.
## Decision
We have decided to reconsolidate both the Daily Journal and Project View modules back into a single overarching html file, and have the app function from a single main homepage rather than jumping between subpages.
- The file explorer component will no longer solely be housed by files.html, and the journal component will no longer be solely housed by journal.html.
- Functionality of both components will be ported to a new file, main.html
## Rationale
The original rationale behind the separated modular approach was to facilitate simultaneous work on different components while minimizing merge conflicts.
Now that the components are much more complete and have been integrated with each other, keeping them separate is no longer as necessary.
In addition to this, a new UI redesign features a fluid swipe rotation between the two modules. It would be unrealistic to design a fluid animation that transitions between changing pages.
As such, this necessitates both modules to be hosted on a single page, hence requiring a reconsolidation.
