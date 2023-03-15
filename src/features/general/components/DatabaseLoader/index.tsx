import {useCallback, useEffect, useState} from "react";
import {Button, ButtonGroup, Card, CardContent, CircularProgress, Collapse, Dialog, Typography} from '@mui/material';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineItem,
    TimelineDot,
    TimelineOppositeContent, TimelineSeparator
} from "@mui/lab";
import Database, {DatabaseProgress} from "../../api/Database";
import useDatabaseContext from "../../context/DatabaseContext/useDatabaseContext";

const DatabaseLoader = () => {
    const {
        database,
        setDatabase,
    } = useDatabaseContext();
    const [isLoaded, setLoaded] = useState<boolean | undefined>(undefined);
    const [currentProgress, setCurrentProgress] = useState<DatabaseProgress | null>(null)
    const [currentStep, setCurrentStep] = useState<'pokemon' | 'complete' | null>(null);

    useEffect(() => {
        // @ts-ignore
        window.pkd = new Database();
        // @ts-ignore
        setDatabase(window.pkd);
    }, []);

    useEffect(() => {
        if (database) {
            database.isReady().then(setLoaded);
        }
    }, [database]);

    useEffect(() => {
        if (!currentStep || !database) {
            return;
        }
        setCurrentProgress(null);
        switch (currentStep) {
            case 'pokemon':
                database.setupPokemon({
                    onProgressUpdate: setCurrentProgress,
                });
                break;
        }
    }, [currentStep, database]);

    useEffect(() => {
        if (currentProgress && currentProgress.completed === currentProgress.max) {
            switch (currentStep) {
                case 'pokemon':
                    setCurrentStep('complete');
                    break;
            }
        }
    }, [currentProgress]);

    const startLoad = useCallback(() => {
        setCurrentStep('pokemon');
    }, []);

    if (isLoaded == null) {
        return null;
    }

    return (
        <Dialog onClose={() => {}} open={!isLoaded}>
            <Card

            >
                <CardContent>
                    <Typography gutterBottom>
                        Could not find the database on your device. How would you like to configure the database seeding?
                    </Typography>
                    <ButtonGroup
                        fullWidth
                    >
                        <Button>
                            All At Once
                        </Button>
                        <Button>
                            As Needed
                        </Button>
                        <Button>
                            Background
                        </Button>
                    </ButtonGroup>
                    <Button
                        color={"success"}
                        fullWidth
                        onClick={startLoad}
                        variant={"contained"}
                    >
                        Start
                    </Button>
                    <Collapse in={!!(currentStep && currentStep !== 'complete')}>
                        <Timeline>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineConnector />
                                    <TimelineDot>
                                        {/* TODO Fill out */}
                                        <CircularProgress />
                                    </TimelineDot>
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Typography variant="h6" component="span">
                                        PokeDex Entries
                                    </Typography>
                                    <Typography>
                                        {currentStep === 'pokemon' && currentProgress ? (
                                            `${currentProgress.completed} / ${currentProgress.max} (eta. ${Math.floor(currentProgress.estimatedRemaining / 1000)} seconds remaining)`
                                        ) : (currentStep === null || !currentProgress) ? '' : 'Completed.'}
                                    </Typography>
                                </TimelineContent>
                            </TimelineItem>
                        </Timeline>
                    </Collapse>
                    <Collapse in={currentStep === 'complete'}>
                        <Typography>
                            Completed Successfully.
                        </Typography>
                    </Collapse>
                </CardContent>
            </Card>
        </Dialog>
    );
};

export default DatabaseLoader;
