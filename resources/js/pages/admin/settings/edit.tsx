import { Form, Head } from '@inertiajs/react';
import SettingController from '@/actions/App/Http/Controllers/Admin/SettingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SettingFormData } from '@/types';

type PageProps = {
    setting: SettingFormData;
};

export default function EditSetting({ setting }: PageProps) {
    return (
        <>
            <Head title="Settings" />

            <div>
                <h2 className="text-lg font-semibold">App settings</h2>
                <p className="text-sm text-muted-foreground">
                    Branding and SEO defaults for the whole app.
                </p>
            </div>

            <Form
                action={SettingController.update.url()}
                method="post"
                options={{ preserveScroll: true }}
                className="max-w-md space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="app_name">App name</Label>
                            <Input
                                id="app_name"
                                name="app_name"
                                required
                                defaultValue={setting.app_name}
                            />
                            <InputError message={errors.app_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo">Logo</Label>
                            {setting.logo_path && (
                                <img
                                    src={setting.logo_path}
                                    alt="Current logo"
                                    className="h-12 w-auto rounded border"
                                />
                            )}
                            <Input
                                id="logo"
                                name="logo"
                                type="file"
                                accept="image/*"
                            />
                            <InputError message={errors.logo} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="favicon">Favicon</Label>
                            {setting.favicon_path && (
                                <img
                                    src={setting.favicon_path}
                                    alt="Current favicon"
                                    className="h-8 w-8 rounded border"
                                />
                            )}
                            <Input
                                id="favicon"
                                name="favicon"
                                type="file"
                                accept="image/*"
                            />
                            <InputError message={errors.favicon} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="primary_color">Primary color</Label>
                            <Input
                                id="primary_color"
                                name="primary_color"
                                type="color"
                                defaultValue={
                                    setting.primary_color ?? '#0ea5e9'
                                }
                                className="h-10 w-20 p-1"
                            />
                            <InputError message={errors.primary_color} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="seo_title">SEO title</Label>
                            <Input
                                id="seo_title"
                                name="seo_title"
                                defaultValue={setting.seo_title ?? ''}
                            />
                            <InputError message={errors.seo_title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="seo_description">
                                SEO description
                            </Label>
                            <Textarea
                                id="seo_description"
                                name="seo_description"
                                defaultValue={setting.seo_description ?? ''}
                            />
                            <InputError message={errors.seo_description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="seo_keywords">SEO keywords</Label>
                            <Input
                                id="seo_keywords"
                                name="seo_keywords"
                                defaultValue={setting.seo_keywords ?? ''}
                            />
                            <InputError message={errors.seo_keywords} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Save settings
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
