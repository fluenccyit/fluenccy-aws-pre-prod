import React, { memo } from 'react';
import { Button, Page, PageContent, Text } from '@client/common';
import BuildYourPlanSvg from '@assets/svg/build-your-plan.svg';
import { useIntercom } from 'react-use-intercom';
import { useIsOrganisationTokenInactive } from '@client/organisation';

type Props = {
    btnText?: string;
    onClick?: Function
};

export const PlanPage = memo(({btnText = "Get in touch", onClick}:Props) => {
    const { show: showIntercom } = useIntercom();
    const isTokenInactive = useIsOrganisationTokenInactive();

    return (
        <div className="flex flex-col items-center max-w-xl self-center">
            <BuildYourPlanSvg />
            <Text className="font-bold text-2xl text-center mt-8" isBlock>
                Build your own plan
            </Text>

            <Text className="text-center mt-8" isBlock>
                Our Fluenccy customised plans are designed to reduce foreign Current Impacts and provide stable, predictable outcomes for your business.
                We&apos;re still building this feature at the moment, get in touch below to see how we can help you today.
            </Text>

            <Button className="mt-8" variant="success" onClick={onClick || showIntercom} isRounded>
                {btnText}
            </Button>
        </div>
    );
});
