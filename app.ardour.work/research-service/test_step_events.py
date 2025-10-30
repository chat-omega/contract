"""
Quick test to verify step events are firing correctly
"""

import asyncio
from research_agent import ResearchAgent


async def test_step_events():
    """Test that step events fire in the correct order"""
    agent = ResearchAgent()

    events = []

    def event_callback(event):
        if event.get("type") == "step_started":
            events.append(event)
            print(f"✓ Step started: {event['step']} - {event['phase']}")

    def progress_callback(msg):
        print(f"  Progress: {msg}")

    # Run a very short research query
    query = "What is SaaS?"
    print(f"\n{'='*60}")
    print(f"Testing step events with query: {query}")
    print(f"{'='*60}\n")

    try:
        report = await agent.research(
            query=query,
            model="gpt-4o-mini",  # Use faster model for testing
            progress_callback=progress_callback,
            event_callback=event_callback
        )

        print(f"\n{'='*60}")
        print("Test Results:")
        print(f"{'='*60}")
        print(f"Total steps emitted: {len(events)}")
        print(f"\nStep sequence:")
        for i, event in enumerate(events, 1):
            print(f"  {i}. {event['step']} ({event['phase']})")

        print(f"\n✓ Expected steps: search → synthesis")
        print(f"✓ Received steps: {' → '.join([e['step'] for e in events])}")

        if len(events) == 2 and events[0]['step'] == 'search' and events[1]['step'] == 'synthesis':
            print(f"\n✅ SUCCESS! Step events are firing correctly!")
            return True
        else:
            print(f"\n❌ FAILURE! Step events are not correct!")
            return False

    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_step_events())
    exit(0 if success else 1)
