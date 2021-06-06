import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import tw from 'twin.macro';
import { useRouteMatch } from 'react-router-dom';
import { action, Action, Actions, createContextStore, useStoreActions } from 'easy-peasy';
import { Mount } from '@/api/admin/mounts/getMounts';
import getMount from '@/api/admin/mounts/getMount';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ApplicationStore } from '@/state';
import { boolean, object, string } from 'yup';
import updateMount from '@/api/admin/mounts/updateMount';
import AdminBox from '@/components/admin/AdminBox';
import Button from '@/components/elements/Button';
import Field from '@/components/elements/Field';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Field as FormikField, Form, Formik, FormikHelpers } from 'formik';
import Label from '@/components/elements/Label';
import MountDeleteButton from '@/components/admin/mounts/MountDeleteButton';

interface ctx {
    mount: Mount | undefined;
    setMount: Action<ctx, Mount | undefined>;
}

export const Context = createContextStore<ctx>({
    mount: undefined,

    setMount: action((state, payload) => {
        state.mount = payload;
    }),
});

interface Values {
    name: string;
    description: string;
    source: string;
    target: string;
    readOnly: string;
    userMountable: string;
}

const EditInformationContainer = () => {
    const history = useHistory();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const mount = Context.useStoreState(state => state.mount);
    const setMount = Context.useStoreActions(actions => actions.setMount);

    if (mount === undefined) {
        return (
            <></>
        );
    }

    const submit = ({ name, description, source, target, readOnly, userMountable }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('mount');

        updateMount(mount.id, name, description, source, target, readOnly === '1', userMountable === '1')
            .then(() => setMount({ ...mount, name, description, source, target, readOnly: readOnly === '1', userMountable: userMountable === '1' }))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'mount', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: mount.name,
                description: mount.description || '',
                source: mount.source,
                target: mount.target,
                readOnly: mount.readOnly ? '1' : '0',
                userMountable: mount.userMountable ? '1' : '0',
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().max(255, ''),
                source: string().max(255, ''),
                target: string().max(255, ''),
                readOnly: boolean(),
                userMountable: boolean(),
            })}
        >
            {
                ({ isSubmitting, isValid }) => (
                    <React.Fragment>
                        <AdminBox title={'Edit Mount'} css={tw`relative`}>
                            <SpinnerOverlay visible={isSubmitting}/>

                            <Form css={tw`mb-0`}>
                                <div>
                                    <Field
                                        id={'name'}
                                        name={'name'}
                                        label={'Name'}
                                        type={'text'}
                                    />
                                </div>

                                <div css={tw`mt-6`}>
                                    <Field
                                        id={'description'}
                                        name={'description'}
                                        label={'Description'}
                                        type={'text'}
                                    />
                                </div>

                                <div css={tw`md:w-full md:flex md:flex-row mt-6`}>
                                    <div css={tw`md:w-full md:flex md:flex-col md:mr-4 mt-6 md:mt-0`}>
                                        <Field
                                            id={'source'}
                                            name={'source'}
                                            label={'Source'}
                                            type={'text'}
                                        />
                                    </div>

                                    <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mt-6 md:mt-0`}>
                                        <Field
                                            id={'target'}
                                            name={'target'}
                                            label={'Target'}
                                            type={'text'}
                                        />
                                    </div>
                                </div>

                                <div css={tw`md:w-full md:flex md:flex-row mt-6`}>
                                    <div css={tw`md:w-full md:flex md:flex-col md:mr-4 mt-6 md:mt-0`}>
                                        <Label htmlFor={'readOnly'}>Permissions</Label>

                                        <div>
                                            <label css={tw`inline-flex items-center mr-2`}>
                                                <FormikField
                                                    name={'readOnly'}
                                                    type={'radio'}
                                                    value={'0'}
                                                />
                                                <span css={tw`ml-2`}>Writable</span>
                                            </label>

                                            <label css={tw`inline-flex items-center ml-2`}>
                                                <FormikField
                                                    name={'readOnly'}
                                                    type={'radio'}
                                                    value={'1'}
                                                />
                                                <span css={tw`ml-2`}>Read Only</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mt-6 md:mt-0`}>
                                        <Label htmlFor={'userMountable'}>User Mountable</Label>

                                        <div>
                                            <label css={tw`inline-flex items-center mr-2`}>
                                                <FormikField
                                                    name={'userMountable'}
                                                    type={'radio'}
                                                    value={'0'}
                                                />
                                                <span css={tw`ml-2`}>Admin Only</span>
                                            </label>

                                            <label css={tw`inline-flex items-center ml-2`}>
                                                <FormikField
                                                    name={'userMountable'}
                                                    type={'radio'}
                                                    value={'1'}

                                                />
                                                <span css={tw`ml-2`}>Users</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div css={tw`w-full flex flex-row items-center mt-6`}>
                                    <div css={tw`flex`}>
                                        <MountDeleteButton
                                            mountId={mount.id}
                                            onDeleted={() => history.push('/admin/mounts')}
                                        />
                                    </div>

                                    <div css={tw`flex ml-auto`}>
                                        <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </AdminBox>
                    </React.Fragment>
                )
            }
        </Formik>
    );
};

const MountEditContainer = () => {
    const match = useRouteMatch<{ id?: string }>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ loading, setLoading ] = useState(true);

    const mount = Context.useStoreState(state => state.mount);
    const setMount = Context.useStoreActions(actions => actions.setMount);

    useEffect(() => {
        clearFlashes('mount');

        getMount(Number(match.params?.id))
            .then(mount => setMount(mount))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'mount', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || mount === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'mount'} css={tw`mb-4`}/>

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'}/>
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Mount - ' + mount.name}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{mount.name}</h2>
                    {
                        (mount.description || '').length < 1 ?
                            <p css={tw`text-base text-neutral-400`}>
                                <span css={tw`italic`}>No description</span>
                            </p>
                            :
                            <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>{mount.description}</p>
                    }
                </div>
            </div>

            <FlashMessageRender byKey={'mount'} css={tw`mb-4`}/>

            <EditInformationContainer/>
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <MountEditContainer/>
        </Context.Provider>
    );
};
