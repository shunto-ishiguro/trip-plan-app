//app/appContent/page.tsx
import Main from './Main';
import { getTravelPlans } from '../actions/travel/getTravelPlans';

export default async function AppContent() {

    const plans = await getTravelPlans();

    return (
        <Main plans={plans} />
    );
}